import { NextRequest, NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const parsedLimit = Math.min(Math.max(Number(limitParam ?? 10), 1), 100);
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;
  const rows = await getGlobalLeaderboard(limit);

  return NextResponse.json({
    scope: 'global',
    limit,
    rows: rows.map((row, index) => ({
      rank: index + 1,
      challenge: row.challenge,
      user: { handle: row.displayName },
      method: row.methodUsed,
      score: Number((row.passRate * 100).toFixed(2)),
      selfTimeSec: row.selfReportedMinutes ? row.selfReportedMinutes * 60 : null,
      runtimeMs: row.runtimeMs,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
