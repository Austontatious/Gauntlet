import fs from 'node:fs';

export default async function* gauntletReporter(source) {
  let testsTotal = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  const failures = [];

  for await (const { type, data } of source) {
    if (type === 'test:pass') {
      testsTotal += 1;
      testsPassed += 1;
    }

    if (type === 'test:fail') {
      testsTotal += 1;
      testsFailed += 1;
      failures.push({
        name: data?.name,
        message: data?.details?.error?.message || data?.error?.message,
      });
    }
  }

  const outputPath = process.env.GAUNTLET_TEST_OUTPUT || 'gauntlet-test-results.json';
  const payload = {
    testsTotal,
    testsPassed,
    testsFailed,
    failures,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
}
