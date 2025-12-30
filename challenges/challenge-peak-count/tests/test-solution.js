import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { countPeaksRef } from "./helpers.js";

test("peak-count: exports solve(arr)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("peak-count: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[1], 0],
    [[1, 2], 0],
    [[1, 3, 2], 1],
    [[1, 3, 2, 4, 4, 1], 1],
    [[5, 4, 3, 2, 1], 0],
    [[1, 2, 3, 2, 1], 1],
    [[1, 2, 2, 1], 0],
  ];

  for (const [arr, expected] of cases) {
    const out = solve(arr);
    assert.equal(Number.isInteger(out), true, "Output must be an integer");
    assert.equal(out, expected);
  }
});

test("peak-count: large sanity vs reference", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 200000;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = i % 1000;
  const expected = countPeaksRef(arr);
  const out = solve(arr);
  assert.equal(out, expected);
});
