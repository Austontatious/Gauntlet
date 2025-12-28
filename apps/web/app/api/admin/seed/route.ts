import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db';
import { resolveRepoRoot } from '@/lib/paths';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const token = request.headers.get('x-admin-token');
  return token && token === process.env.ADMIN_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repoRoot = resolveRepoRoot();
  const challengeDir = path.resolve(repoRoot, 'challenges/challenge-001');
  const specPath = path.join(challengeDir, 'spec.md');
  const scoringPath = path.join(challengeDir, 'scoring.json');

  const scoringConfig = JSON.parse(await fs.readFile(scoringPath, 'utf8'));

  await prisma.challenge.upsert({
    where: { slug: 'challenge-001' },
    update: {
      title: 'Challenge 001: Sum Signal',
      shortDescription: 'Implement the sum function with correct edge handling.',
      specMarkdownPath: path.relative(repoRoot, specPath),
      scoringConfig,
      visibility: 'PUBLIC',
    },
    create: {
      slug: 'challenge-001',
      title: 'Challenge 001: Sum Signal',
      shortDescription: 'Implement the sum function with correct edge handling.',
      specMarkdownPath: path.relative(repoRoot, specPath),
      scoringConfig,
      visibility: 'PUBLIC',
    },
  });

  return NextResponse.json({ ok: true });
}
