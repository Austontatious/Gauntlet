import type { MethodUsed } from '@prisma/client';
import { prisma } from './db';

export type LeaderboardRow = {
  submissionId: string;
  displayName: string;
  methodUsed: MethodUsed;
  selfReportedMinutes: number | null;
  passRate: number;
  testsPassed: number;
  testsTotal: number;
  runtimeMs: number;
  createdAt: Date;
  repoUrl: string | null;
  challenge: {
    slug: string;
    title: string;
  };
};

function parseResult(result: unknown) {
  const typed = (result ?? {}) as {
    passRate?: number;
    testsPassed?: number;
    testsTotal?: number;
    runtimeMs?: number;
  };

  return {
    passRate: typed.passRate ?? 0,
    testsPassed: typed.testsPassed ?? 0,
    testsTotal: typed.testsTotal ?? 0,
    runtimeMs: typed.runtimeMs ?? 0,
  };
}

function sortRows(rows: LeaderboardRow[]) {
  return [...rows].sort((a, b) => {
    if (a.passRate !== b.passRate) {
      return b.passRate - a.passRate;
    }
    if (a.runtimeMs !== b.runtimeMs) {
      return a.runtimeMs - b.runtimeMs;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export async function getLeaderboardBySlug(slug: string, limit = 10) {
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return [];

  const submissions = await prisma.submission.findMany({
    where: { challengeId: challenge.id, status: 'COMPLETE' },
    orderBy: { createdAt: 'asc' },
  });

  const rows: LeaderboardRow[] = submissions.map((submission) => {
    const result = parseResult(submission.result);
    return {
      submissionId: submission.id,
      displayName: submission.displayName,
      methodUsed: submission.methodUsed,
      selfReportedMinutes: submission.selfReportedMinutes ?? null,
      passRate: result.passRate,
      testsPassed: result.testsPassed,
      testsTotal: result.testsTotal,
      runtimeMs: result.runtimeMs,
      createdAt: submission.createdAt,
      repoUrl: submission.repoUrl ?? null,
      challenge: {
        slug: challenge.slug,
        title: challenge.title,
      },
    };
  });

  return sortRows(rows).slice(0, limit);
}

export async function getGlobalLeaderboard(limit = 10) {
  const submissions = await prisma.submission.findMany({
    where: { status: 'COMPLETE' },
    include: { challenge: { select: { slug: true, title: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const rows: LeaderboardRow[] = submissions.map((submission) => {
    const result = parseResult(submission.result);
    return {
      submissionId: submission.id,
      displayName: submission.displayName,
      methodUsed: submission.methodUsed,
      selfReportedMinutes: submission.selfReportedMinutes ?? null,
      passRate: result.passRate,
      testsPassed: result.testsPassed,
      testsTotal: result.testsTotal,
      runtimeMs: result.runtimeMs,
      createdAt: submission.createdAt,
      repoUrl: submission.repoUrl ?? null,
      challenge: {
        slug: submission.challenge.slug,
        title: submission.challenge.title,
      },
    };
  });

  return sortRows(rows).slice(0, limit);
}
