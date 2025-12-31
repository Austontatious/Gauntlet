import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { slidingMedianRef, windowMedian } from "./helpers.js";

test("streaming-median-2: exports solve(arr, k)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("streaming-median-2: small cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[1, 3, -1, -3, 5, 3, 6, 7], 3, [1, -1, -1, 3, 5, 6]],
    [[1, 2, 3, 4], 2, [1, 2, 3]],
    [[5, 4, 3, 2, 1], 4, [3, 3]],
  ];

  for (const [arr, k, expected] of cases) {
    const out = solve(arr, k);
    assert.deepEqual(out, expected);
  }
});

test("streaming-median-2: deterministic sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 5000;
  const k = 50;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = (i * 37) % 1000 - 500;

  const expected = slidingMedianRef(arr, k);
  const out = solve(arr, k);
  assert.deepEqual(out, expected);
});

test("streaming-median-2: large sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 300000;
  const k = 1000;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = (i * 13) % 10000 - 5000;

  const out = solve(arr, k);
  assert.equal(out.length, n - k + 1);

  for (let i = 0; i < 3; i++) {
    const expected = windowMedian(arr, i, k);
    assert.equal(out[i], expected);
  }
  for (let i = out.length - 3; i < out.length; i++) {
    const expected = windowMedian(arr, i, k);
    assert.equal(out[i], expected);
  }
});
