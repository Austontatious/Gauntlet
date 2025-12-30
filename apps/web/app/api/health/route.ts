import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const workerEnabled = process.env.WORKER_ENABLED === 'true';
  const runUntrusted = process.env.RUN_UNTRUSTED_CODE === 'true';

  return NextResponse.json({
    executionEnabled: workerEnabled && runUntrusted,
  });
}
