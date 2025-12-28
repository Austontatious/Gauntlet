import { NextResponse } from 'next/server';
import { getLeaderboardBySlug } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const leaderboard = await getLeaderboardBySlug(params.slug);
  return NextResponse.json(leaderboard);
}
