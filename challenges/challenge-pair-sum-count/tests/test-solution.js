import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pairCountRef } from "./helpers.js";

test("pair-sum-count: exports solve(arr, target)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("pair-sum-count: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[1, 5, 3, 3, 2], 6, 2n],
    [[0, 0, 0], 0, 3n],
    [[-1, 1, 2, -2, 3], 0, 2n],
    [[10], 10, 0n],
  ];

  for (const [arr, target, expected] of cases) {
    const out = solve(arr, target);
    const outBig = typeof out === "bigint" ? out : BigInt(out);
    assert.equal(outBig, expected);
  }
});

test("pair-sum-count: large sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const arr = [];
  for (let i = 0; i < 200000; i++) arr.push(i % 1000);
  const target = 777;
  const expected = pairCountRef(arr, target);
  const out = solve(arr, target);
  const outBig = typeof out === "bigint" ? out : BigInt(out);
  assert.equal(outBig, expected);
});
