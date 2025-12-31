import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { sum } from "./helpers.js";

test("even-split-2: exports solve(total, n, locked)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

function validateSplit(total, n, locked, out) {
  assert.ok(Array.isArray(out), "Output must be an array");
  assert.equal(out.length, n, "Output array must have length n");
  for (const x of out) {
    assert.equal(Number.isInteger(x), true, "All parts must be integers");
    assert.ok(x >= 0, "All parts must be non-negative");
  }

  const lockedMap = new Map();
  let lockedSum = 0;
  for (const [idx, value] of locked) {
    lockedMap.set(idx, value);
    lockedSum += value;
  }

  assert.equal(sum(out), total, "Sum(parts) must equal total");
  for (const [idx, value] of lockedMap.entries()) {
    assert.equal(out[idx], value, "Locked indices must match exactly");
  }

  const freeIndices = [];
  for (let i = 0; i < n; i++) {
    if (!lockedMap.has(i)) freeIndices.push(i);
  }

  const remaining = total - lockedSum;
  if (freeIndices.length === 0) {
    assert.equal(remaining, 0, "No free slots means locked sum must equal total");
    return;
  }

  const base = Math.floor(remaining / freeIndices.length);
  const extra = remaining % freeIndices.length;
  for (let i = 0; i < freeIndices.length; i++) {
    const idx = freeIndices[i];
    const expected = base + (i < extra ? 1 : 0);
    assert.equal(out[idx], expected, "Free indices must be as even as possible");
  }
}

test("even-split-2: locked cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [10, 4, [[1, 2]], [3, 2, 3, 2]],
    [4, 4, [[0, 1], [2, 1]], [1, 1, 1, 1]],
    [6, 3, [[0, 2], [1, 2], [2, 2]], [2, 2, 2]],
  ];

  for (const [total, n, locked, expected] of cases) {
    const out = solve(total, n, locked);
    validateSplit(total, n, locked, out);
    assert.deepEqual(out, expected);
  }
});

test("even-split-2: impossible inputs", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [3, 3, [[0, 4]]],
    [3, 3, [[0, -1]]],
    [3, 3, [[3, 1]]],
    [3, 3, [[1, 1], [1, 2]]],
  ];

  for (const [total, n, locked] of cases) {
    const out = solve(total, n, locked);
    assert.equal(out, null);
  }
});

test("even-split-2: large n sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 200000;
  const locked = [];
  let lockedSum = 0;
  for (let i = 0; i < 500; i++) {
    const idx = i * 400;
    const value = (i % 5) + 1;
    locked.push([idx, value]);
    lockedSum += value;
  }
  const freeCount = n - locked.length;
  const base = 3;
  const extra = 12345;
  const total = lockedSum + freeCount * base + extra;

  const out = solve(total, n, locked);
  validateSplit(total, n, locked, out);
});
