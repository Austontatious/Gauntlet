import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
  });

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: submission.id,
    challengeId: submission.challengeId,
    displayName: submission.displayName,
    methodUsed: submission.methodUsed,
    selfReportedMinutes: submission.selfReportedMinutes,
    submitType: submission.submitType,
    repoUrl: submission.repoUrl,
    status: submission.status,
    result: submission.result,
    logExcerpt: submission.logExcerpt,
    createdAt: submission.createdAt,
  });
}
