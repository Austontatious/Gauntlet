import { PrismaClient, ChallengeVisibility } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

async function main() {
  const challengeDir = path.resolve('challenges/challenge-001');
  const specPath = path.join(challengeDir, 'spec.md');
  const scoringPath = path.join(challengeDir, 'scoring.json');

  const scoringConfig = JSON.parse(await fs.readFile(scoringPath, 'utf8'));

  await prisma.challenge.upsert({
    where: { slug: 'challenge-001' },
    update: {
      title: 'Challenge 001: Sum Signal',
      shortDescription: 'Implement the sum function with correct edge handling.',
      specMarkdownPath: path.relative(process.cwd(), specPath),
      scoringConfig,
      visibility: ChallengeVisibility.PUBLIC,
    },
    create: {
      slug: 'challenge-001',
      title: 'Challenge 001: Sum Signal',
      shortDescription: 'Implement the sum function with correct edge handling.',
      specMarkdownPath: path.relative(process.cwd(), specPath),
      scoringConfig,
      visibility: ChallengeVisibility.PUBLIC,
    },
  });
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
