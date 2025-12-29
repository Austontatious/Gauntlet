import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import AdmZip from 'adm-zip';
import type { Challenge, Submission } from '@prisma/client';
import { buildSubmissionResult, parseTestOutput } from '@gauntlet/core';
import { runCommand } from './utils/command.js';
import { copyDir, ensureDir, tailLines } from './utils/files.js';
import { resolveRepoRoot } from './utils/paths.js';

interface ScoringConfig {
  testsPath: string;
  maxZipBytes: number;
  maxFileCount: number;
  installTimeoutMs: number;
  testTimeoutMs: number;
  totalTimeoutMs: number;
}

interface RunnerOutput {
  result: ReturnType<typeof buildSubmissionResult> | null;
  logExcerpt: string | null;
  errorSummary: string | null;
  commitHash?: string | null;
}

const DEFAULT_CONFIG: ScoringConfig = {
  testsPath: 'tests',
  maxZipBytes: 20 * 1024 * 1024,
  maxFileCount: 2000,
  installTimeoutMs: 4 * 60 * 1000,
  testTimeoutMs: 2 * 60 * 1000,
  totalTimeoutMs: 7 * 60 * 1000,
};

function commandExists(command: string) {
  const result = spawnSync('which', [command]);
  return result.status === 0;
}

function parseConfig(config: unknown): ScoringConfig {
  if (!config || typeof config !== 'object') {
    return DEFAULT_CONFIG;
  }

  const partial = config as Partial<ScoringConfig>;
  return {
    testsPath: partial.testsPath ?? DEFAULT_CONFIG.testsPath,
    maxZipBytes: partial.maxZipBytes ?? DEFAULT_CONFIG.maxZipBytes,
    maxFileCount: partial.maxFileCount ?? DEFAULT_CONFIG.maxFileCount,
    installTimeoutMs: partial.installTimeoutMs ?? DEFAULT_CONFIG.installTimeoutMs,
    testTimeoutMs: partial.testTimeoutMs ?? DEFAULT_CONFIG.testTimeoutMs,
    totalTimeoutMs: partial.totalTimeoutMs ?? DEFAULT_CONFIG.totalTimeoutMs,
  };
}

async function collectTestFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(fullPath)));
    } else if (entry.isFile() && /\.test\.(c|m)?js$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function prepareSourceDir(
  submission: Submission,
  sourceDir: string,
  config: ScoringConfig,
): Promise<{ commitHash?: string | null }> {
  if (submission.submitType === 'GITHUB_REPO' && submission.repoUrl) {
    const clone = await runCommand('git', ['clone', '--depth=1', submission.repoUrl, sourceDir], {
      cwd: process.cwd(),
      timeoutMs: config.totalTimeoutMs,
    });

    if (clone.code !== 0) {
      throw new Error(`git clone failed: ${clone.stderr || clone.stdout}`);
    }

    const commit = await runCommand('git', ['rev-parse', 'HEAD'], {
      cwd: sourceDir,
      timeoutMs: 10_000,
    });

    return { commitHash: commit.stdout.trim() || null };
  }

  if (submission.submitType === 'ZIP_UPLOAD' && submission.zipPath) {
    const repoRoot = resolveRepoRoot();
    const zipPath = path.isAbsolute(submission.zipPath)
      ? submission.zipPath
      : path.resolve(repoRoot, submission.zipPath);
    const zipStats = statSync(zipPath);
    if (zipStats.size > config.maxZipBytes) {
      throw new Error(`ZIP exceeds max size (${config.maxZipBytes} bytes)`);
    }

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    if (entries.length > config.maxFileCount) {
      throw new Error(`ZIP contains too many files (${entries.length})`);
    }

    for (const entry of entries) {
      const normalized = path.normalize(entry.entryName);
      if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
        throw new Error('ZIP contains invalid paths');
      }
    }

    zip.extractAllTo(sourceDir, true);
    return {};
  }

  throw new Error('Unsupported submission type');
}

function selectInstallCommand(sourceDir: string) {
  const hasPnpmLock = existsSync(path.join(sourceDir, 'pnpm-lock.yaml'));
  const hasPackageLock = existsSync(path.join(sourceDir, 'package-lock.json'));
  const hasPnpm = commandExists('pnpm');

  if (hasPnpmLock && hasPnpm) {
    return { command: 'pnpm', args: ['install', '--frozen-lockfile'] };
  }

  if (hasPackageLock) {
    return { command: 'npm', args: ['ci'] };
  }

  return { command: 'npm', args: ['install'] };
}

export async function scoreSubmission(
  submission: Submission,
  challenge: Challenge,
): Promise<RunnerOutput> {
  const config = parseConfig(challenge.scoringConfig);
  const repoRoot = resolveRepoRoot();
  const runsDir = process.env.RUNS_DIR
    ? path.resolve(repoRoot, process.env.RUNS_DIR)
    : path.resolve(repoRoot, 'data/runs');
  await ensureDir(runsDir);

  const runDir = path.join(runsDir, `${submission.id}-${Date.now()}`);
  const sourceDir = path.join(runDir, 'source');
  const gauntletDir = path.join(runDir, 'gauntlet');
  const testsDest = path.join(gauntletDir, 'tests');

  await ensureDir(sourceDir);
  await ensureDir(gauntletDir);

  let logBuffer = '';
  let commitHash: string | null = null;

  try {
    const prep = await prepareSourceDir(submission, sourceDir, config);
    commitHash = prep.commitHash ?? null;

    const packageJsonPath = path.join(sourceDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const installCommand = selectInstallCommand(sourceDir);
      const install = await runCommand(installCommand.command, installCommand.args, {
        cwd: sourceDir,
        timeoutMs: config.installTimeoutMs,
      });

      logBuffer += install.stdout + '\n' + install.stderr;

      if (install.code !== 0 || install.timedOut) {
        throw new Error(
          `Dependency install failed (${installCommand.command})${
            install.timedOut ? ' (timeout)' : ''
          }`,
        );
      }
    }

    const challengeDir = path.dirname(path.resolve(repoRoot, challenge.specMarkdownPath));
    const testSourceDir = path.join(challengeDir, config.testsPath);
    await copyDir(testSourceDir, testsDest);

    const testFiles = await collectTestFiles(testsDest);
    if (testFiles.length === 0) {
      throw new Error('No test files found');
    }

    const reporterSource = path.join(testSourceDir, 'gauntlet-reporter.mjs');
    const reporterDest = path.join(gauntletDir, 'gauntlet-reporter.mjs');
    if (!existsSync(reporterSource)) {
      throw new Error('Missing gauntlet-reporter.mjs in challenge tests');
    }
    await fs.copyFile(reporterSource, reporterDest);

    const outputPath = path.join(gauntletDir, 'test-results.json');

    const testCommand = await runCommand(
      'node',
      ['--test', `--test-reporter=${reporterDest}`, ...testFiles],
      {
        cwd: sourceDir,
        timeoutMs: config.testTimeoutMs,
        env: {
          GAUNTLET_SUBMISSION_DIR: sourceDir,
          GAUNTLET_TEST_OUTPUT: outputPath,
        },
      },
    );

    logBuffer += testCommand.stdout + '\n' + testCommand.stderr;

    if (!existsSync(outputPath)) {
      throw new Error('Test results file missing');
    }

    const rawOutput = await fs.readFile(outputPath, 'utf8');
    const errorSummary =
      testCommand.code === 0 && !testCommand.timedOut
        ? null
        : `Tests failed${testCommand.timedOut ? ' (timeout)' : ''}`;

    const parsed = parseTestOutput(rawOutput);
    const result = buildSubmissionResult(parsed, testCommand.durationMs, errorSummary);

    return {
      result,
      logExcerpt: tailLines(logBuffer, 200),
      errorSummary,
      commitHash,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown runner error';

    return {
      result: null,
      logExcerpt: tailLines(logBuffer, 200),
      errorSummary: message,
      commitHash,
    };
  } finally {
    if (!process.env.KEEP_RUN_DIR) {
      await fs.rm(runDir, { recursive: true, force: true });
    }
  }
}
