import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  MAX_FILE_COUNT,
  MAX_JOB_RUNTIME_MS,
  MAX_UNZIPPED_BYTES,
  MAX_ZIP_BYTES,
  MAX_LOG_BYTES,
  WORKER_MAX_CONCURRENCY,
} from '@/lib/limits';

export const dynamic = 'force-dynamic';

export async function GET() {
  const workerEnabled = process.env.WORKER_ENABLED === 'true';
  const runUntrusted = process.env.RUN_UNTRUSTED_CODE === 'true';
  let dbReachable = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbReachable = false;
  }

  return NextResponse.json({
    executionEnabled: workerEnabled && runUntrusted && dbReachable,
    dbReachable,
    limits: {
      maxJobRuntimeMs: MAX_JOB_RUNTIME_MS,
      maxZipBytes: MAX_ZIP_BYTES,
      maxUnzippedBytes: MAX_UNZIPPED_BYTES,
      maxFileCount: MAX_FILE_COUNT,
      workerMaxConcurrency: WORKER_MAX_CONCURRENCY,
      maxLogBytes: MAX_LOG_BYTES,
    },
  });
}
