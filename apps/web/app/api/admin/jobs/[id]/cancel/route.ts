import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.headers.get('x-admin-token') ?? request.nextUrl.searchParams.get('token');

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let reason = 'canceled_by_admin';
  try {
    const body = (await request.json()) as { reason?: string };
    if (body?.reason) {
      reason = String(body.reason).slice(0, 200);
    }
  } catch {
    // No body provided.
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status === 'COMPLETE' || job.status === 'FAILED' || job.status === 'TIMEOUT') {
    return NextResponse.json({ status: job.status });
  }

  await prisma.job.update({
    where: { id },
    data: {
      status: 'CANCELED',
      cancelReason: reason,
      finishedAt: null,
    },
  });

  const submissionId = (job.payload as { submissionId?: string })?.submissionId;
  if (submissionId) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'FAILED',
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

  return NextResponse.json({ status: 'CANCELED' });
}
