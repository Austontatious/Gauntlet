import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import AdmZip from 'adm-zip';
import type { Challenge, Submission } from '@prisma/client';
import { buildSubmissionResult, parseTestOutput } from '@gauntlet/core';
import { runCommand } from './utils/command.js';
import { copyDir, ensureDir, tailLines } from './utils/files.js';
import { resolveRepoRoot } from './utils/paths.js';

interface ScoringConfig {
  testsPath: string;
  maxZipBytes: number;
  maxUnzippedBytes: number;
  maxWorkspaceBytes: number;
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
  timedOut?: boolean;
}

interface RunnerOptions {
  maxRuntimeMs: number;
  runnerHandle: string;
}

const DEFAULT_CONFIG: ScoringConfig = {
  testsPath: 'tests',
  maxZipBytes: 20 * 1024 * 1024,
  maxUnzippedBytes: 50 * 1024 * 1024,
  maxWorkspaceBytes: 50 * 1024 * 1024,
  maxFileCount: 2000,
  installTimeoutMs: 4 * 60 * 1000,
  testTimeoutMs: 2 * 60 * 1000,
  totalTimeoutMs: 7 * 60 * 1000,
};

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function normalizeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseConfig(config: unknown): ScoringConfig {
  if (!config || typeof config !== 'object') {
    return DEFAULT_CONFIG;
  }

  const partial = config as Partial<ScoringConfig>;
  return {
    testsPath: partial.testsPath ?? DEFAULT_CONFIG.testsPath,
    maxZipBytes: normalizeNumber(partial.maxZipBytes, DEFAULT_CONFIG.maxZipBytes),
    maxUnzippedBytes: normalizeNumber(
      partial.maxUnzippedBytes,
      DEFAULT_CONFIG.maxUnzippedBytes,
    ),
    maxWorkspaceBytes: normalizeNumber(
      partial.maxWorkspaceBytes,
      DEFAULT_CONFIG.maxWorkspaceBytes,
    ),
    maxFileCount: normalizeNumber(partial.maxFileCount, DEFAULT_CONFIG.maxFileCount),
    installTimeoutMs: normalizeNumber(
      partial.installTimeoutMs,
      DEFAULT_CONFIG.installTimeoutMs,
    ),
    testTimeoutMs: normalizeNumber(partial.testTimeoutMs, DEFAULT_CONFIG.testTimeoutMs),
    totalTimeoutMs: normalizeNumber(
      partial.totalTimeoutMs,
      DEFAULT_CONFIG.totalTimeoutMs,
    ),
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

async function measureDirectorySize(dir: string, maxBytes: number): Promise<number> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      total += await measureDirectorySize(fullPath, maxBytes - total);
    } else if (entry.isFile()) {
      const stats = await fs.stat(fullPath);
      total += stats.size;
    }

    if (total > maxBytes) {
      throw new Error(`Workspace exceeds size limit (${maxBytes} bytes)`);
    }
  }

  return total;
}

async function assertWorkspaceSize(dir: string, maxBytes: number) {
  await measureDirectorySize(dir, maxBytes);
}

async function prepareSourceDir(
  submission: Submission,
  sourceDir: string,
  config: ScoringConfig,
  timeoutMs: number,
): Promise<{ commitHash?: string | null }> {
  if (submission.submitType === 'GITHUB_REPO' && submission.repoUrl) {
    const clone = await runCommand('git', ['clone', '--depth=1', submission.repoUrl, sourceDir], {
      cwd: process.cwd(),
      timeoutMs,
    });

    if (clone.timedOut) {
      throw new TimeoutError('Execution timed out');
    }

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
    const zipStats = await fs.stat(zipPath);
    if (zipStats.size > config.maxZipBytes) {
      throw new Error(`ZIP exceeds max size (${config.maxZipBytes} bytes)`);
    }

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    if (entries.length > config.maxFileCount) {
      throw new Error(`ZIP contains too many files (${entries.length})`);
    }

    let totalUnzipped = 0;
    for (const entry of entries) {
      const normalized = path.normalize(entry.entryName);
      if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
        throw new Error('ZIP contains invalid paths');
      }

      if (!entry.isDirectory) {
        const entrySize = typeof entry.header?.size === 'number' ? entry.header.size : 0;
        totalUnzipped += entrySize;
        if (totalUnzipped > config.maxUnzippedBytes) {
          throw new Error(`ZIP expands beyond limit (${config.maxUnzippedBytes} bytes)`);
        }
      }
    }

    zip.extractAllTo(sourceDir, true);
    return {};
  }

  throw new Error('Unsupported submission type');
}

async function readPackageJson(sourceDir: string) {
  const packageJsonPath = path.join(sourceDir, 'package.json');
  if (!existsSync(packageJsonPath)) return null;

  const raw = await fs.readFile(packageJsonPath, 'utf8');
  return JSON.parse(raw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

async function buildInstallCommand(sourceDir: string): Promise<string | null> {
  const packageJson = await readPackageJson(sourceDir);
  if (!packageJson) return null;

  const dependencies = Object.keys(packageJson.dependencies ?? {}).length;
  const devDependencies = Object.keys(packageJson.devDependencies ?? {}).length;
  if (dependencies === 0 && devDependencies === 0) {
    return null;
  }

  const hasPackageLock = existsSync(path.join(sourceDir, 'package-lock.json'));
  if (hasPackageLock) {
    return 'npm ci';
  }

  return 'npm install';
}

function toContainerPath(root: string, filePath: string, containerRoot: string) {
  const relative = path.relative(root, filePath).split(path.sep).join('/');
  return `${containerRoot}/${relative}`;
}

async function runSandboxCommand(options: {
  containerName: string;
  workDir: string;
  command: string[];
  env: Record<string, string>;
  timeoutMs: number;
}) {
  const image = process.env.DOCKER_NODE_IMAGE || 'node:22-slim';
  const dockerArgs = [
    'run',
    '--rm',
    '--name',
    options.containerName,
    '--network',
    'none',
    '--memory',
    '512m',
    '--pids-limit',
    '256',
    '--cpus',
    '1',
    '--read-only',
    '--tmpfs',
    '/tmp:rw,noexec,nosuid,size=64m',
    '-v',
    `${options.workDir}:/work:rw`,
    '-w',
    '/work',
  ];

  for (const [key, value] of Object.entries(options.env)) {
    dockerArgs.push('-e', `${key}=${value}`);
  }

  dockerArgs.push(image, ...options.command);

  return runCommand('docker', dockerArgs, {
    cwd: process.cwd(),
    timeoutMs: options.timeoutMs,
  });
}

async function killSandbox(containerName: string) {
  await runCommand('docker', ['rm', '-f', containerName], {
    cwd: process.cwd(),
    timeoutMs: 5000,
  });
}

export async function scoreSubmission(
  submission: Submission,
  challenge: Challenge,
  options: RunnerOptions,
): Promise<RunnerOutput> {
  const config = parseConfig(challenge.scoringConfig);
  const repoRoot = resolveRepoRoot();
  const baseDir = process.env.RUNS_DIR
    ? path.resolve(process.env.RUNS_DIR)
    : path.join(os.tmpdir(), 'gauntlet', 'jobs');
  await ensureDir(baseDir);

  const runDir = await fs.mkdtemp(path.join(baseDir, `${submission.id}-`));
  const submissionDir = path.join(runDir, 'submission');
  const testsDir = path.join(runDir, 'tests');
  const runOutputDir = path.join(runDir, 'run');

  await ensureDir(submissionDir);
  await ensureDir(testsDir);
  await ensureDir(runOutputDir);

  let logBuffer = '';
  let commitHash: string | null = null;
  const startTime = Date.now();
  const hardTimeoutMs = Math.min(options.maxRuntimeMs, config.totalTimeoutMs);

  function remainingMs() {
    return Math.max(hardTimeoutMs - (Date.now() - startTime), 0);
  }

  try {
    const prep = await prepareSourceDir(submission, submissionDir, config, hardTimeoutMs);
    commitHash = prep.commitHash ?? null;

    await assertWorkspaceSize(submissionDir, config.maxWorkspaceBytes);

    const challengeDir = path.dirname(path.resolve(repoRoot, challenge.specMarkdownPath));
    const testSourceDir = path.join(challengeDir, config.testsPath);
    await copyDir(testSourceDir, testsDir);

    const testFiles = await collectTestFiles(testsDir);
    if (testFiles.length === 0) {
      throw new Error('No test files found');
    }

    const reporterSource = path.join(testSourceDir, 'gauntlet-reporter.mjs');
    const reporterDest = path.join(runDir, 'gauntlet-reporter.mjs');
    if (!existsSync(reporterSource)) {
      throw new Error('Missing gauntlet-reporter.mjs in challenge tests');
    }
    await fs.copyFile(reporterSource, reporterDest);

    await assertWorkspaceSize(runDir, config.maxWorkspaceBytes);

    if (remainingMs() <= 0) {
      throw new TimeoutError('Execution timed out');
    }

    const outputPath = path.join(runOutputDir, 'test-results.json');
    const containerTestFiles = testFiles.map((file) =>
      toContainerPath(testsDir, file, '/work/tests'),
    );

    const installCommand = await buildInstallCommand(submissionDir);
    const testCommand = `node --test --test-reporter=/work/gauntlet-reporter.mjs ${containerTestFiles.join(
      ' ',
    )}`;
    const script = installCommand ? `${installCommand} && ${testCommand}` : testCommand;

    const timeoutMs = Math.max(1, remainingMs());

    const result = await runSandboxCommand({
      containerName: options.runnerHandle,
      workDir: runDir,
      command: ['sh', '-c', script],
      env: {
        GAUNTLET_SUBMISSION_DIR: '/work/submission',
        GAUNTLET_TEST_OUTPUT: '/work/run/test-results.json',
        NODE_OPTIONS: '--max-old-space-size=256',
        HOME: '/tmp',
        NPM_CONFIG_CACHE: '/tmp/.npm',
        NPM_CONFIG_AUDIT: 'false',
        NPM_CONFIG_FUND: 'false',
      },
      timeoutMs,
    });

    logBuffer += `${result.stdout}\n${result.stderr}`;

    if (result.timedOut || remainingMs() <= 0) {
      await killSandbox(options.runnerHandle);
      throw new TimeoutError('Execution timed out');
    }

    if (!existsSync(outputPath)) {
      throw new Error('Test results file missing');
    }

    const rawOutput = await fs.readFile(outputPath, 'utf8');
    const errorSummary =
      result.code === 0 && !result.timedOut
        ? null
        : `Tests failed${result.timedOut ? ' (timeout)' : ''}`;

    const parsed = parseTestOutput(rawOutput);
    const summaryLines = [
      '',
      'Gauntlet test summary',
      `Tests passed: ${parsed.testsPassed}/${parsed.testsTotal}`,
      `Runtime: ${result.durationMs}ms`,
      errorSummary ? `Status: ${errorSummary}` : 'Status: OK',
    ];

    if (parsed.failures?.length) {
      summaryLines.push('Failures:');
      for (const failure of parsed.failures) {
        const name = failure.name ?? 'Unnamed test';
        const message = failure.message ?? 'No message';
        summaryLines.push(`- ${name}: ${message}`);
      }
    }

    logBuffer += `${summaryLines.join('\n')}\n`;

    const submissionResult = buildSubmissionResult(
      parsed,
      result.durationMs,
      errorSummary,
    );

    return {
      result: submissionResult,
      logExcerpt: tailLines(logBuffer, 200),
      errorSummary,
      commitHash,
      timedOut: false,
    };
  } catch (error) {
    const timedOut = error instanceof TimeoutError;
    const message = timedOut
      ? 'Execution timed out'
      : error instanceof Error
        ? error.message
        : 'Unknown runner error';

    return {
      result: null,
      logExcerpt: tailLines(logBuffer, 200),
      errorSummary: message,
      commitHash,
      timedOut,
    };
  } finally {
    if (!process.env.KEEP_RUN_DIR) {
      await fs.rm(runDir, { recursive: true, force: true });
    }
  }
}
