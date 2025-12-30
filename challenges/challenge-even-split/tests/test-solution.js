import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { sum } from "./helpers.js";

test("even-split: exports solve(total, n)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

function validate(total, n, out) {
  assert.ok(Array.isArray(out), "Output must be an array");
  assert.equal(out.length, n, "Output array must have length n");
  for (const x of out) {
    assert.equal(Number.isInteger(x), true, "All parts must be integers");
    assert.ok(x >= 0, "All parts must be non-negative");
  }
  assert.equal(sum(out), total, "Sum(parts) must equal total");
  const min = Math.min(...out);
  const max = Math.max(...out);
  assert.ok(max - min <= 1, "Parts must differ by at most 1");
}

test("even-split: sample + edge cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [10, 3, [4, 3, 3]],
    [0, 5, [0, 0, 0, 0, 0]],
    [3, 5, [1, 1, 1, 0, 0]],
    [5, 5, [1, 1, 1, 1, 1]],
    [1, 2, [1, 0]],
  ];

  for (const [total, n, expected] of cases) {
    const out = solve(total, n);
    validate(total, n, out);
    assert.deepEqual(out, expected);
  }
});

test("even-split: large n sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const total = 123456789;
  const n = 100000;
  const out = solve(total, n);
  validate(total, n, out);
});
