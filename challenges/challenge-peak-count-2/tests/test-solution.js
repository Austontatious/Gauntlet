import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { peakCountRef } from "./helpers.js";

test("peak-count-2: exports solve(arr)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("peak-count-2: basic cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[1, 2, 1], 1],
    [[1, 2, 2, 1], 1],
    [[1, 2, 2, 3, 2], 0],
    [[2, 2, 1], 0],
    [[1, 3, 3, 3, 2, 2, 4, 1], 1],
    [[], 0],
    [[1, 2], 0],
  ];

  for (const [arr, expected] of cases) {
    const out = solve(arr);
    assert.equal(out, expected);
  }
});

test("peak-count-2: deterministic sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 200000;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    const block = Math.floor(i / 5);
    arr[i] = (block * 7 + i) % 50;
  }

  const expected = peakCountRef(arr);
  const out = solve(arr);
  assert.equal(out, expected);
});
