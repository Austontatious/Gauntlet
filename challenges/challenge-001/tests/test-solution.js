import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

test("sum-signal: exports solve(numbers)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("sum-signal: sums positive numbers", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);
  assert.equal(solve([1, 2, 3, 4]), 10);
});

test("sum-signal: sums negative numbers", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);
  assert.equal(solve([-4, 2, -3]), -5);
});

test("sum-signal: handles empty arrays", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);
  assert.equal(solve([]), 0);
});

test("sum-signal: handles mixed values", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);
  assert.equal(solve([10, -5, 7]), 12);
});
