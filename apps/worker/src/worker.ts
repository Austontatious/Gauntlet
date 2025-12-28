import os from 'node:os';
import { prisma } from './db';
import { scoreSubmission } from './runner';

interface WorkerOptions {
  intervalMs: number;
}

let busy = false;

export async function startWorker({ intervalMs }: WorkerOptions) {
  const host = os.hostname();

  async function poll() {
    if (busy) return;
    busy = true;

    try {
      const job = await prisma.job.findFirst({
        where: { status: 'QUEUED' },
        orderBy: { createdAt: 'asc' },
      });

      if (!job) {
        return;
      }

      const locked = await prisma.job.updateMany({
        where: { id: job.id, status: 'QUEUED' },
        data: {
          status: 'RUNNING',
          lockedAt: new Date(),
          lockedBy: host,
          attempts: { increment: 1 },
        },
      });

      if (locked.count === 0) {
        return;
      }

      await handleJob(job.id);
    } finally {
      busy = false;
    }
  }

  await poll();
  setInterval(poll, intervalMs);
}

async function handleJob(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return;
  }

  if (job.type !== 'SCORE_SUBMISSION') {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });
    return;
  }

  const submissionId = (job.payload as { submissionId?: string })?.submissionId;
  if (!submissionId) {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'FAILED' } });
    return;
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'FAILED' } });
    return;
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: submission.challengeId } });
  if (!challenge) {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'FAILED' } });
    return;
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'RUNNING' },
  });

  const scored = await scoreSubmission(submission, challenge);

  if (!scored.result) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'FAILED',
        logExcerpt: scored.logExcerpt,
        result: scored.errorSummary
          ? {
              passRate: 0,
              testsPassed: 0,
              testsTotal: 0,
              runtimeMs: 0,
              errorSummary: scored.errorSummary,
            }
          : null,
        commitHash: scored.commitHash,
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    });

    return;
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: 'COMPLETE',
      result: scored.result,
      logExcerpt: scored.logExcerpt,
      commitHash: scored.commitHash,
    },
  });

  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'COMPLETE' },
  });
}
