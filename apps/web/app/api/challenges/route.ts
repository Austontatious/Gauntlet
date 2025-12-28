import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const challenges = await prisma.challenge.findMany({
    where: { visibility: { in: ['PUBLIC', 'UNLISTED'] } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    challenges.map((challenge) => ({
      slug: challenge.slug,
      title: challenge.title,
      shortDescription: challenge.shortDescription,
      visibility: challenge.visibility,
    })),
  );
}
