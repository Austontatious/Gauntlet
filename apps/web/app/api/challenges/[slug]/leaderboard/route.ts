import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardBySlug } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const leaderboard = await getLeaderboardBySlug(slug);
  return NextResponse.json(leaderboard);
}
