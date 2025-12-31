import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { resolveRepoRoot } from '@/lib/paths';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const token = request.headers.get('x-admin-token');
  return token && token === process.env.ADMIN_TOKEN;
}

type ChallengeMetadata = {
  slug?: string;
  title?: string;
  shortDescription?: string | null;
};

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const { code } = error as { code?: string };
      if (code === 'ENOENT') return null;
    }
    throw error;
  }
}

function fallbackTitleFromSlug(slug: string) {
  return `Challenge: ${slug.replace(/-/g, ' ')}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const clearSlug = requestUrl.searchParams.get('clearSlug')?.trim() || null;

  const repoRoot = resolveRepoRoot();
  const challengesRoot = path.resolve(repoRoot, 'challenges');
  const entries = await fs.readdir(challengesRoot, { withFileTypes: true });

  const updated = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('challenge-')) continue;

    const challengeDir = path.join(challengesRoot, entry.name);
    const specPath = path.join(challengeDir, 'spec.md');
    const scoringPath = path.join(challengeDir, 'scoring.json');
    const metadataPath = path.join(challengeDir, 'metadata.json');

    const metadata = await readJsonIfExists<ChallengeMetadata>(metadataPath);
    const scoringConfig: Prisma.InputJsonValue =
      (await readJsonIfExists<Prisma.InputJsonValue>(scoringPath)) ?? {};

    let slug = metadata?.slug;
    let title = metadata?.title;
    let shortDescription = metadata?.shortDescription ?? null;

    if (!slug) slug = entry.name.replace(/^challenge-/, '');
    if (!title) title = fallbackTitleFromSlug(slug);
    if (!shortDescription) shortDescription = title;

    await prisma.challenge.upsert({
      where: { slug },
      update: {
        title,
        shortDescription,
        specMarkdownPath: path.relative(repoRoot, specPath),
        scoringConfig,
        visibility: 'PUBLIC',
      },
      create: {
        slug,
        title,
        shortDescription,
        specMarkdownPath: path.relative(repoRoot, specPath),
        scoringConfig,
        visibility: 'PUBLIC',
      },
    });

    updated.push({ slug, updated: 1 });
  }

  let clearedCount = 0;
  if (clearSlug) {
    const challenge = await prisma.challenge.findUnique({ where: { slug: clearSlug } });
    if (challenge) {
      const result = await prisma.submission.deleteMany({
        where: { challengeId: challenge.id },
      });
      clearedCount = result.count;
    }
  }

  return NextResponse.json({
    ok: true,
    updated,
    cleared: clearSlug ? { slug: clearSlug, deleted: clearedCount } : null,
  });
}
