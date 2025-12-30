import { PrismaClient, ChallengeVisibility } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

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

async function main() {
  const challengesRoot = path.resolve('challenges');
  const entries = await fs.readdir(challengesRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('challenge-')) continue;

    const challengeDir = path.join(challengesRoot, entry.name);
    const specPath = path.join(challengeDir, 'spec.md');
    const scoringPath = path.join(challengeDir, 'scoring.json');
    const metadataPath = path.join(challengeDir, 'metadata.json');

    const metadata = await readJsonIfExists<ChallengeMetadata>(metadataPath);
    const scoringConfig = (await readJsonIfExists<Record<string, unknown>>(scoringPath)) ?? {};

    let slug = metadata?.slug;
    let title = metadata?.title;
    let shortDescription = metadata?.shortDescription ?? null;

    if (!metadata && entry.name === 'challenge-001') {
      slug = 'challenge-001';
      title = 'Challenge 001: Sum Signal';
      shortDescription = 'Implement the sum function with correct edge handling.';
    }

    if (!slug) slug = entry.name.replace(/^challenge-/, '');
    if (!title) title = fallbackTitleFromSlug(slug);
    if (!shortDescription) shortDescription = title;

    await prisma.challenge.upsert({
      where: { slug },
      update: {
        title,
        shortDescription,
        specMarkdownPath: path.relative(process.cwd(), specPath),
        scoringConfig,
        visibility: ChallengeVisibility.PUBLIC,
      },
      create: {
        slug,
        title,
        shortDescription,
        specMarkdownPath: path.relative(process.cwd(), specPath),
        scoringConfig,
        visibility: ChallengeVisibility.PUBLIC,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
