import type { LeaderboardEntry } from '@gauntlet/core';
import { sortLeaderboard } from '@gauntlet/core';
import { prisma } from './db';

export async function getLeaderboardBySlug(slug: string) {
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return [];

  const submissions = await prisma.submission.findMany({
    where: { challengeId: challenge.id, status: 'COMPLETE' },
    orderBy: { createdAt: 'asc' },
  });

  const entries: LeaderboardEntry[] = submissions.map((submission) => {
    const result = (submission.result ?? {}) as {
      passRate?: number;
      testsPassed?: number;
      testsTotal?: number;
      runtimeMs?: number;
    };

    return {
      submissionId: submission.id,
      displayName: submission.displayName,
      methodUsed: submission.methodUsed,
      selfReportedMinutes: submission.selfReportedMinutes,
      passRate: result.passRate ?? 0,
      testsPassed: result.testsPassed ?? 0,
      testsTotal: result.testsTotal ?? 0,
      runtimeMs: result.runtimeMs ?? 0,
      createdAt: submission.createdAt,
      repoUrl: submission.repoUrl,
    };
  });

  return sortLeaderboard(entries);
}
