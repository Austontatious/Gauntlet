import { NextRequest, NextResponse } from 'next/server';
import { getChallengeBySlug } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getChallengeBySlug(slug);

  if (!data) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  return NextResponse.json({
    slug: data.challenge.slug,
    title: data.challenge.title,
    shortDescription: data.challenge.shortDescription,
    specMarkdown: data.specMarkdown,
    scoringConfig: data.challenge.scoringConfig,
    visibility: data.challenge.visibility,
  });
}
