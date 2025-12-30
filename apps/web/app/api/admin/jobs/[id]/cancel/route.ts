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

  const job = await prisma.job.findFirst({
    where: { id, status: { in: ['QUEUED', 'RUNNING'] } },
  });
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // job.status is intentionally narrowed to QUEUED/RUNNING by the query context.
  // Terminal states are not returned here. "TIMEOUT" is not a distinct status in practice;
  // timeouts are recorded as FAILED with an error message.

  const cancelMessage = reason?.trim()
    ? `Canceled by admin: ${reason.trim()}`
    : 'Canceled by admin';

  await prisma.job.update({
    where: { id },
    data: {
      // v0.1: no dedicated CANCELED status in schema.
      // Treat admin-initiated cancellation as a terminal FAILED with a clear reason.
      status: 'FAILED',
      cancelReason: cancelMessage,
      finishedAt: new Date(),
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
          errorSummary: cancelMessage,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return NextResponse.json({ status: 'FAILED', errorSummary: cancelMessage });
}
