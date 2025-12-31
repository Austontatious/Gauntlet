import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pairSumCountsRef } from "./helpers.js";

test("pair-sum-count-2: exports solve(arr, queries)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("pair-sum-count-2: small correctness", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[1, 2, 3, 4], [3, 5, 7], [1n, 2n, 1n]],
    [[1, 1, 1, 1], [2], [6n]],
    [[-2, 0, 2, 4], [2, 4], [1n, 1n]],
  ];

  for (const [arr, queries, expected] of cases) {
    const out = solve(arr, queries);
    assert.deepEqual(out, expected);
  }
});

test("pair-sum-count-2: regime 1 (low unique, many queries)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const arr = new Array(200000);
  for (let i = 0; i < arr.length; i++) arr[i] = (i % 100) - 50;

  const queries = new Array(50000);
  for (let i = 0; i < queries.length; i++) queries[i] = (i % 201) - 100;

  const expected = pairSumCountsRef(arr, queries);
  const out = solve(arr, queries);
  assert.deepEqual(out, expected);
});

test("pair-sum-count-2: regime 2 (high unique, few queries)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const arr = new Array(50000);
  for (let i = 0; i < arr.length; i++) arr[i] = i * 3 - 75000;

  const queries = [0, 3, 6, 9, -3, 150000];

  const expected = pairSumCountsRef(arr, queries);
  const out = solve(arr, queries);
  assert.deepEqual(out, expected);
});
