const { PrismaClient } = require('@prisma/client');

const updates = {
  'mirror-words': {
    title: 'Challenge 002: Mirror Words',
    shortDescription:
      'Reverse each word in a string while preserving word order and normalizing whitespace.',
  },
  'even-split': {
    title: 'Challenge 003: Even Split',
    shortDescription:
      'Split a total into n non-negative integers as evenly as possible, with earlier parts taking leftovers.',
  },
  'peak-count': {
    title: 'Challenge 004: Peak Count',
    shortDescription:
      'Count how many array elements are strictly greater than both immediate neighbors.',
  },
  'stable-dedupe': {
    title: 'Challenge 005: Stable Dedupe',
    shortDescription:
      'Remove duplicate strings while preserving the order of first occurrence.',
  },
  'interval-coverage': {
    title: 'Challenge 006: Interval Coverage',
    shortDescription:
      'Compute how many integer points are covered by at least one closed interval.',
  },
  'pair-sum-count': {
    title: 'Challenge 007: Pair Sum Count',
    shortDescription:
      'Count the number of index pairs (i < j) whose values sum to a target.',
  },
  'min-rotations': {
    title: 'Challenge 008: Minimal Rotations',
    shortDescription:
      'Find the minimum left-rotations needed to transform one string into another (or -1 if impossible).',
  },
  'threshold-flood': {
    title: 'Challenge 009: Threshold Flood',
    shortDescription:
      'For each query, count cells reachable from a start position using only grid values >= threshold.',
  },
  'streaming-median': {
    title: 'Challenge 010: Streaming Median With Deletions',
    shortDescription:
      'Maintain a multiset under insert/delete and output the lower median on demand.',
  },
};

async function main() {
  const prisma = new PrismaClient();

  for (const [slug, data] of Object.entries(updates)) {
    const result = await prisma.challenge.updateMany({
      where: { slug },
      data,
    });
    console.log(`${slug}: updated ${result.count}`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
