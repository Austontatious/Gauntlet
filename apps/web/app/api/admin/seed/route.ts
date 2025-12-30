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

  const updates = [
    {
      slug: 'mirror-words',
      title: 'Challenge 002: Mirror Words',
      shortDescription:
        'Reverse each word in a string while preserving word order and normalizing whitespace.',
    },
    {
      slug: 'even-split',
      title: 'Challenge 003: Even Split',
      shortDescription:
        'Split a total into n non-negative integers as evenly as possible, with earlier parts taking leftovers.',
    },
    {
      slug: 'peak-count',
      title: 'Challenge 004: Peak Count',
      shortDescription:
        'Count how many array elements are strictly greater than both immediate neighbors.',
    },
    {
      slug: 'stable-dedupe',
      title: 'Challenge 005: Stable Dedupe',
      shortDescription:
        'Remove duplicate strings while preserving the order of first occurrence.',
    },
    {
      slug: 'interval-coverage',
      title: 'Challenge 006: Interval Coverage',
      shortDescription:
        'Compute how many integer points are covered by at least one closed interval.',
    },
    {
      slug: 'pair-sum-count',
      title: 'Challenge 007: Pair Sum Count',
      shortDescription:
        'Count the number of index pairs (i < j) whose values sum to a target.',
    },
    {
      slug: 'min-rotations',
      title: 'Challenge 008: Minimal Rotations',
      shortDescription:
        'Find the minimum left-rotations needed to transform one string into another (or -1 if impossible).',
    },
    {
      slug: 'threshold-flood',
      title: 'Challenge 009: Threshold Flood',
      shortDescription:
        'For each query, count cells reachable from a start position using only grid values >= threshold.',
    },
    {
      slug: 'streaming-median',
      title: 'Challenge 010: Streaming Median With Deletions',
      shortDescription:
        'Maintain a multiset under insert/delete and output the lower median on demand.',
    },
  ];

  const updateResults = await Promise.all(
    updates.map((challenge) =>
      prisma.challenge.updateMany({
        where: { slug: challenge.slug },
        data: {
          title: challenge.title,
          shortDescription: challenge.shortDescription,
        },
      }),
    ),
  );

  const updated = updates.map((challenge, index) => ({
    slug: challenge.slug,
    updated: updateResults[index]?.count ?? 0,
  }));

  return NextResponse.json({ ok: true, updated });
}
