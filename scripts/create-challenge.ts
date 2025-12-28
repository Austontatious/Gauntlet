import fs from 'node:fs/promises';
import path from 'node:path';

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: pnpm create-challenge <slug>');
  process.exit(1);
}

const challengeDir = path.resolve('challenges', slug);

async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

async function main() {
  await ensureDir(challengeDir);
  await ensureDir(path.join(challengeDir, 'tests'));
  await ensureDir(path.join(challengeDir, 'starter'));

  const specPath = path.join(challengeDir, 'spec.md');
  const scoringPath = path.join(challengeDir, 'scoring.json');

  await fs.writeFile(
    specPath,
    `# ${slug}\n\nDescribe the challenge here.\n`,
    { flag: 'wx' },
  );

  await fs.writeFile(
    scoringPath,
    JSON.stringify(
      {
        testsPath: 'tests',
        maxZipBytes: 20971520,
        maxFileCount: 2000,
        installTimeoutMs: 240000,
        testTimeoutMs: 120000,
        totalTimeoutMs: 420000,
      },
      null,
      2,
    ) + '\n',
    { flag: 'wx' },
  );

  const testsDir = path.join(challengeDir, 'tests');
  await fs.writeFile(
    path.join(testsDir, 'example.test.js'),
    `const test = require('node:test');\nconst assert = require('node:assert');\n\ntest('example', () => {\n  assert.strictEqual(1 + 1, 2);\n});\n`,
    { flag: 'wx' },
  );

  await fs.writeFile(
    path.join(testsDir, 'gauntlet-reporter.mjs'),
    `import fs from 'node:fs';\n\nexport default async function* gauntletReporter(source) {\n  let testsTotal = 0;\n  let testsPassed = 0;\n  let testsFailed = 0;\n\n  for await (const { type } of source) {\n    if (type === 'test:pass') {\n      testsTotal += 1;\n      testsPassed += 1;\n    }\n\n    if (type === 'test:fail') {\n      testsTotal += 1;\n      testsFailed += 1;\n    }\n  }\n\n  const outputPath = process.env.GAUNTLET_TEST_OUTPUT || 'gauntlet-test-results.json';\n  fs.writeFileSync(\n    outputPath,\n    JSON.stringify({ testsTotal, testsPassed, testsFailed }, null, 2),\n  );\n}\n`,
    { flag: 'wx' },
  );

  console.log(`Created challenge scaffold at ${challengeDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
