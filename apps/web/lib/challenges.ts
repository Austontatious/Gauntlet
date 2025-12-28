import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from './db';
import { resolveRepoRoot } from './paths';

export async function getPublicChallenges() {
  return prisma.challenge.findMany({
    where: {
      visibility: { in: ['PUBLIC', 'UNLISTED'] },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getChallengeBySlug(slug: string) {
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) return null;

  const repoRoot = resolveRepoRoot();
  const specPath = path.resolve(repoRoot, challenge.specMarkdownPath);
  const specMarkdown = await fs.readFile(specPath, 'utf8');

  return { challenge, specMarkdown };
}
