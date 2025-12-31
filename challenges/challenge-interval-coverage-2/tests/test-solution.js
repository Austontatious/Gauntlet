import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { intervalCoverageRef } from "./helpers.js";

test("interval-coverage-2: exports solve(intervals)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("interval-coverage-2: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [[[1, 3], [5, 6], [2, 5]], { covered: 6n, maxOverlap: 2 }],
    [[[0, 0]], { covered: 1n, maxOverlap: 1 }],
    [[[-2, 2], [10, 10]], { covered: 6n, maxOverlap: 1 }],
    [[[1, 2], [3, 4]], { covered: 4n, maxOverlap: 1 }],
    [[[1, 4], [2, 5], [3, 6]], { covered: 6n, maxOverlap: 3 }],
  ];

  for (const [intervals, expected] of cases) {
    const out = solve(intervals);
    assert.equal(typeof out, "object");
    assert.equal(typeof out.covered, "bigint", "covered must be a BigInt");
    assert.equal(typeof out.maxOverlap, "number", "maxOverlap must be a number");
    assert.deepEqual(out, expected);
  }
});

test("interval-coverage-2: deterministic sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const intervals = [];
  for (let i = 0; i < 100000; i++) {
    const l = (i % 1000) * 7;
    const r = l + (i % 9);
    intervals.push([l, r]);
  }

  const expected = intervalCoverageRef(intervals);
  const out = solve(intervals);
  assert.deepEqual(out, expected);
});
