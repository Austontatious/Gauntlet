const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const submissionDir = process.env.GAUNTLET_SUBMISSION_DIR;
if (!submissionDir) {
  throw new Error('GAUNTLET_SUBMISSION_DIR is not set');
}

const solutionPath = path.join(submissionDir, 'src', 'solution.js');
const mod = require(solutionPath);
const sum = mod.sum ?? mod.default;

if (typeof sum !== 'function') {
  throw new Error('Expected module to export a sum function');
}

test('sums positive numbers', () => {
  assert.strictEqual(sum([1, 2, 3, 4]), 10);
});

test('sums negative numbers', () => {
  assert.strictEqual(sum([-4, 2, -3]), -5);
});

test('handles empty arrays', () => {
  assert.strictEqual(sum([]), 0);
});

test('handles mixed values', () => {
  assert.strictEqual(sum([10, -5, 7]), 12);
});
