import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  createSubmissionSchema,
  isGithubRepo,
  normalizeRepoUrl,
} from '@/lib/validation';
import { MAX_ZIP_BYTES, saveZipFile } from '@/lib/uploads';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? 'unknown';
  const ipLimit = Number(process.env.SUBMISSION_RATE_LIMIT_IP ?? 10);
  const ipWindowMs = 60 * 60 * 1000;

  const ipResult = checkRateLimit(`ip:${ip}`, ipLimit, ipWindowMs);
  if (!ipResult.allowed) {
    const retryAfterSeconds = Math.ceil(ipResult.retryAfterMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfterSeconds },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  const formData = await request.formData();

  const challengeSlug = String(formData.get('challengeSlug') || '');
  const displayName = String(formData.get('displayName') || '');
  const methodUsed = String(formData.get('methodUsed') || 'VIBE');
  const submitType = String(formData.get('submitType') || 'GITHUB_REPO');
  const repoUrlValue = formData.get('repoUrl');
  const selfReportedRaw = formData.get('selfReportedMinutes');

  const selfReportedMinutes = selfReportedRaw
    ? Number(selfReportedRaw)
    : null;

  const parsed = createSubmissionSchema.safeParse({
    challengeSlug,
    displayName,
    methodUsed,
    submitType,
    selfReportedMinutes: Number.isFinite(selfReportedMinutes)
      ? selfReportedMinutes
      : null,
    repoUrl: repoUrlValue ? String(repoUrlValue) : null,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const userLimit = Number(process.env.SUBMISSION_RATE_LIMIT_USER ?? 20);
  const userWindowMs = 24 * 60 * 60 * 1000;
  const userKey = `user:${parsed.data.displayName.toLowerCase()}`;
  const userResult = checkRateLimit(userKey, userLimit, userWindowMs);
  if (!userResult.allowed) {
    const retryAfterSeconds = Math.ceil(userResult.retryAfterMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfterSeconds },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    );
  }

  const challenge = await prisma.challenge.findUnique({
    where: { slug: challengeSlug },
  });

  if (!challenge || challenge.visibility === 'DRAFT') {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const repoUrl = normalizeRepoUrl(parsed.data.repoUrl ?? null);

  if (parsed.data.submitType === 'GITHUB_REPO') {
    if (!repoUrl || !isGithubRepo(repoUrl)) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }
  }

  if (parsed.data.submitType === 'ZIP_UPLOAD') {
    const zipFile = formData.get('zipFile');
    if (!zipFile || !(zipFile instanceof File)) {
      return NextResponse.json({ error: 'ZIP file is required' }, { status: 400 });
    }
    if (zipFile.size > MAX_ZIP_BYTES) {
      return NextResponse.json({ error: 'ZIP exceeds size limit' }, { status: 400 });
    }
  }

  const submission = await prisma.submission.create({
    data: {
      challengeId: challenge.id,
      displayName: parsed.data.displayName,
      methodUsed: parsed.data.methodUsed,
      selfReportedMinutes: parsed.data.selfReportedMinutes,
      submitType: parsed.data.submitType,
      repoUrl: parsed.data.submitType === 'GITHUB_REPO' ? repoUrl : null,
      status: 'QUEUED',
    },
  });

  if (parsed.data.submitType === 'ZIP_UPLOAD') {
    const zipFile = formData.get('zipFile') as File;
    const zipPath = await saveZipFile(zipFile, submission.id);
    await prisma.submission.update({
      where: { id: submission.id },
      data: { zipPath },
    });
  }

  await prisma.job.create({
    data: {
      type: 'SCORE_SUBMISSION',
      payload: { submissionId: submission.id },
      status: 'QUEUED',
    },
  });

  return NextResponse.json({ id: submission.id });
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null;
  }
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    null
  );
}
