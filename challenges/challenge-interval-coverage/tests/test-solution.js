import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { coverageRef } from "./helpers.js";

test("interval-coverage: exports solve(intervals)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("interval-coverage: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[[1, 3], [5, 6], [2, 5]], 6n],
    [[[0, 0]], 1n],
    [[[-2, 2], [10, 10]], 6n],
    [[[1, 2], [3, 4]], 4n],
    [[[1, 10], [2, 3], [4, 8]], 10n],
  ];

  for (const [intervals, expectedBig] of cases) {
    const out = solve(intervals);
    assert.equal(Number.isInteger(out) || typeof out === "bigint", true, "Output must be integer or bigint");
    const outBig = typeof out === "bigint" ? out : BigInt(out);
    assert.equal(outBig, expectedBig);
  }
});

test("interval-coverage: deterministic sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const intervals = [];
  for (let i = 0; i < 100000; i++) {
    const l = (i % 1000) * 10;
    const r = l + (i % 7);
    intervals.push([l, r]);
  }
  const expected = coverageRef(intervals);
  const out = solve(intervals);
  const outBig = typeof out === "bigint" ? out : BigInt(out);
  assert.equal(outBig, expected);
});
