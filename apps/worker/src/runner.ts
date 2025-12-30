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
  logsTruncated?: boolean;
}

interface RunnerOptions {
  maxRuntimeMs: number;
  signal?: AbortSignal;
}

function readEnvNumber(key: string, fallback: number) {
  const raw = process.env[key];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const DEFAULT_CONFIG: ScoringConfig = {
  testsPath: 'tests',
  maxZipBytes: readEnvNumber('MAX_ZIP_BYTES', 20 * 1024 * 1024),
  maxUnzippedBytes: readEnvNumber('MAX_UNZIPPED_BYTES', 50 * 1024 * 1024),
  maxWorkspaceBytes: 50 * 1024 * 1024,
  maxFileCount: readEnvNumber('MAX_FILE_COUNT', 2000),
  installTimeoutMs: 4 * 60 * 1000,
  testTimeoutMs: 2 * 60 * 1000,
  totalTimeoutMs: 7 * 60 * 1000,
};

const MAX_LOG_BYTES = readEnvNumber('MAX_LOG_BYTES', 64 * 1024);
const LOG_TRUNCATION_MARKER = '\n...truncated\n';

function appendLog(
  buffer: string,
  addition: string,
  state: { truncated: boolean },
) {
  if (!addition) return buffer;
  const next = buffer + addition;
  if (next.length <= MAX_LOG_BYTES) return next;
  const available = MAX_LOG_BYTES - LOG_TRUNCATION_MARKER.length;
  if (available <= 0) {
    state.truncated = true;
    return LOG_TRUNCATION_MARKER.slice(0, MAX_LOG_BYTES);
  }
  state.truncated = true;
  return LOG_TRUNCATION_MARKER + next.slice(next.length - available);
}

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
  signal?: AbortSignal,
): Promise<{ commitHash?: string | null }> {
  if (submission.submitType === 'GITHUB_REPO' && submission.repoUrl) {
    const clone = await runCommand('git', ['clone', '--depth=1', submission.repoUrl, sourceDir], {
      cwd: process.cwd(),
      timeoutMs,
      signal,
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
      signal,
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

async function assertNoDependencies(sourceDir: string) {
  const packageJson = await readPackageJson(sourceDir);
  if (!packageJson) return;

  const dependencies = Object.keys(packageJson.dependencies ?? {}).length;
  const devDependencies = Object.keys(packageJson.devDependencies ?? {}).length;
  if (dependencies === 0 && devDependencies === 0) {
    return;
  }

  throw new Error('Dependencies are not supported in the v0.1 runner');
}

function resolveNetworkBlockerPath(repoRoot: string) {
  const candidates = [
    path.join(repoRoot, 'apps', 'worker', 'dist', 'sandbox', 'network_blocker.cjs'),
    path.join(repoRoot, 'apps', 'worker', 'sandbox', 'network_blocker.cjs'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error('Missing network blocker script');
}

export async function scoreSubmission(
  submission: Submission,
  challenge: Challenge,
  options: RunnerOptions,
): Promise<RunnerOutput> {
  const config = parseConfig(challenge.scoringConfig);
  const repoRoot = resolveRepoRoot();
  const runsDir = process.env.RUNS_DIR;
  const baseDir = runsDir
    ? path.isAbsolute(runsDir)
      ? runsDir
      : path.join(repoRoot, runsDir)
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
  const logState = { truncated: false };
  let commitHash: string | null = null;
  const startTime = Date.now();
  const hardTimeoutMs = Math.min(options.maxRuntimeMs, config.totalTimeoutMs);

  function remainingMs() {
    return Math.max(hardTimeoutMs - (Date.now() - startTime), 0);
  }

  try {
    const prep = await prepareSourceDir(
      submission,
      submissionDir,
      config,
      hardTimeoutMs,
      options.signal,
    );
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

    await assertNoDependencies(submissionDir);

    if (remainingMs() <= 0) {
      throw new TimeoutError('Execution timed out');
    }

    const outputPath = path.join(runOutputDir, 'test-results.json');
    const blockerPath = resolveNetworkBlockerPath(repoRoot);
    const testArgs = [
      '--require',
      blockerPath,
      '--test',
      '--test-reporter',
      reporterDest,
      ...testFiles,
    ];
    const timeoutMs = Math.max(1, Math.min(config.testTimeoutMs, remainingMs()));

    const result = await runCommand('node', testArgs, {
      cwd: runDir,
      env: {
        GAUNTLET_SUBMISSION_DIR: submissionDir,
        GAUNTLET_TEST_OUTPUT: outputPath,
        NODE_OPTIONS: '--max-old-space-size=256',
      },
      timeoutMs,
      signal: options.signal,
    });

    if (
      result.stdout.includes(LOG_TRUNCATION_MARKER) ||
      result.stderr.includes(LOG_TRUNCATION_MARKER)
    ) {
      logState.truncated = true;
    }

    logBuffer = appendLog(logBuffer, `${result.stdout}\n${result.stderr}`, logState);

    if (result.timedOut || remainingMs() <= 0) {
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

    logBuffer = appendLog(logBuffer, `${summaryLines.join('\n')}\n`, logState);

    const submissionResult = buildSubmissionResult(
      parsed,
      result.durationMs,
      errorSummary,
    );

    return {
      result: { ...submissionResult, logsTruncated: logState.truncated },
      logExcerpt: tailLines(logBuffer, 200),
      errorSummary,
      commitHash,
      timedOut: false,
      logsTruncated: logState.truncated,
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
      logsTruncated: logState.truncated,
    };
  } finally {
    if (!process.env.KEEP_RUN_DIR) {
      await fs.rm(runDir, { recursive: true, force: true });
    }
  }
}
