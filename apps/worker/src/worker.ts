import os from 'node:os';
import { Prisma } from '@prisma/client';
import { prisma } from './db.js';
import { scoreSubmission } from './runner.js';
import { runCommand } from './utils/command.js';

interface WorkerOptions {
  intervalMs: number;
  maxConcurrency: number;
  maxRuntimeMs: number;
  watchdogIntervalMs: number;
}

const CANCEL_GRACE_MS = 1000;

let dockerAvailableCache: boolean | null = null;

async function checkDockerAvailable() {
  if (dockerAvailableCache !== null) {
    return dockerAvailableCache;
  }

  const result = await runCommand(
    'docker',
    ['version', '--format', '{{.Server.Version}}'],
    {
      cwd: process.cwd(),
      timeoutMs: 5000,
    },
  );

  dockerAvailableCache = result.code === 0;
  if (!dockerAvailableCache) {
    console.error('Docker unavailable; refusing to run untrusted code.');
  }

  return dockerAvailableCache;
}

async function killRunnerHandle(handle: string | null) {
  if (!handle) return;
  await runCommand('docker', ['rm', '-f', handle], {
    cwd: process.cwd(),
    timeoutMs: 5000,
  });
}

async function markJobFailed(
  jobId: string,
  submissionId: string | null,
  errorSummary: string,
) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'FAILED',
      finishedAt: new Date(),
      cancelReason: errorSummary,
      runnerHandle: null,
    },
  });

  if (submissionId) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'FAILED',
        logExcerpt: null,
        result: {
          passRate: 0,
          testsPassed: 0,
          testsTotal: 0,
          runtimeMs: 0,
          errorSummary,
        } as Prisma.InputJsonValue,
      },
    });
  }
}

async function cancelJob(
  job: { id: string; payload: Prisma.JsonValue; runnerHandle: string | null },
  status: 'CANCELED' | 'TIMEOUT',
  reason: string,
) {
  await killRunnerHandle(job.runnerHandle);

  await prisma.job.update({
    where: { id: job.id },
    data: {
      status,
      finishedAt: new Date(),
      cancelReason: reason,
      runnerHandle: null,
    },
  });

  const submissionId = (job.payload as { submissionId?: string })?.submissionId ?? null;
  if (submissionId) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'FAILED',
        logExcerpt: null,
        result: {
          passRate: 0,
          testsPassed: 0,
          testsTotal: 0,
          runtimeMs: 0,
          errorSummary: reason,
        } as Prisma.InputJsonValue,
      },
    });
  }
}

export async function startWorker({
  intervalMs,
  maxConcurrency,
  maxRuntimeMs,
  watchdogIntervalMs,
}: WorkerOptions) {
  const host = os.hostname();
  let activeCount = 0;
  let polling = false;

  async function poll() {
    if (polling) return;
    polling = true;

    try {
      while (activeCount < maxConcurrency) {
        const job = await prisma.job.findFirst({
          where: { status: 'QUEUED' },
          orderBy: { createdAt: 'asc' },
        });

        if (!job) {
          return;
        }

        const startedAt = new Date();
        const timeoutAt = new Date(startedAt.getTime() + maxRuntimeMs);

        const locked = await prisma.job.updateMany({
          where: { id: job.id, status: 'QUEUED' },
          data: {
            status: 'RUNNING',
            lockedAt: startedAt,
            lockedBy: host,
            attempts: { increment: 1 },
            startedAt,
            timeoutAt,
          },
        });

        if (locked.count === 0) {
          continue;
        }

        activeCount += 1;
        handleJob(job.id, maxRuntimeMs)
          .catch((error) => {
            console.error('Job handler failed', error);
          })
          .finally(() => {
            activeCount -= 1;
          });
      }
    } finally {
      polling = false;
    }
  }

  await poll();
  setInterval(poll, intervalMs);
  setInterval(() => watchdog(maxRuntimeMs), watchdogIntervalMs);
}

async function watchdog(maxRuntimeMs: number) {
  const now = new Date();
  const graceCutoff = new Date(Date.now() - maxRuntimeMs - CANCEL_GRACE_MS);

  const overdueJobs = await prisma.job.findMany({
    where: {
      status: 'RUNNING',
      OR: [{ timeoutAt: { lt: now } }, { startedAt: { lt: graceCutoff } }],
    },
  });

  for (const job of overdueJobs) {
    await cancelJob(job, 'TIMEOUT', 'timeout');
  }

  const canceledJobs = await prisma.job.findMany({
    where: { status: 'CANCELED', finishedAt: null },
  });

  for (const job of canceledJobs) {
    await cancelJob(job, 'CANCELED', job.cancelReason || 'canceled');
  }
}

async function handleJob(jobId: string, maxRuntimeMs: number) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return;
  }

  if (job.type !== 'SCORE_SUBMISSION') {
    await markJobFailed(jobId, null, 'unsupported_job_type');
    return;
  }

  const submissionId = (job.payload as { submissionId?: string })?.submissionId;
  if (!submissionId) {
    await markJobFailed(jobId, null, 'missing_submission');
    return;
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) {
    await markJobFailed(jobId, submissionId, 'missing_submission');
    return;
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: submission.challengeId } });
  if (!challenge) {
    await markJobFailed(jobId, submissionId, 'missing_challenge');
    return;
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'RUNNING' },
  });

  const dockerAvailable = await checkDockerAvailable();
  if (!dockerAvailable) {
    await markJobFailed(jobId, submissionId, 'sandbox_unavailable');
    return;
  }

  const jobTimeoutMs = Math.min(
    maxRuntimeMs,
    Number((challenge.scoringConfig as { totalTimeoutMs?: number })?.totalTimeoutMs ??
      maxRuntimeMs),
  );

  await prisma.job.update({
    where: { id: jobId },
    data: { timeoutAt: new Date(Date.now() + jobTimeoutMs) },
  });

  const runnerHandle = `gauntlet-${jobId.slice(0, 8)}-${Date.now()}`;
  await prisma.job.update({
    where: { id: jobId },
    data: { runnerHandle },
  });

  const scored = await scoreSubmission(submission, challenge, {
    maxRuntimeMs: jobTimeoutMs,
    runnerHandle,
  });

  const latestJob = await prisma.job.findUnique({ where: { id: jobId } });
  if (!latestJob || latestJob.status !== 'RUNNING') {
    return;
  }

  if (!scored.result) {
    const failureStatus = scored.timedOut ? 'TIMEOUT' : 'FAILED';
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'FAILED',
        logExcerpt: scored.logExcerpt,
        result: scored.errorSummary
          ? ({
              passRate: 0,
              testsPassed: 0,
              testsTotal: 0,
              runtimeMs: 0,
              errorSummary: scored.errorSummary,
            } as Prisma.InputJsonValue)
          : Prisma.DbNull,
        commitHash: scored.commitHash,
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: failureStatus,
        finishedAt: new Date(),
        cancelReason: scored.errorSummary ?? null,
        runnerHandle: null,
      },
    });

    return;
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'COMPLETE',
      result: scored.result as unknown as Prisma.InputJsonValue,
      logExcerpt: scored.logExcerpt,
      commitHash: scored.commitHash,
    },
  });

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETE',
      finishedAt: new Date(),
      runnerHandle: null,
    },
  });
}
