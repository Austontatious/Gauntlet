import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { minRotationsRef } from "./helpers.js";

test("min-rotations-2: exports solve(a, b)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("min-rotations-2: basic cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    ["abcdef", "cdefab", 2],
    ["abcdef", "ab*ef", 0],
    ["abcdef", "cd*ab", 2],
    ["abcdef", "*cdefa", 1],
    ["abc", "acb", -1],
    ["aaaa", "*aaa", 0],
  ];

  for (const [a, b, expected] of cases) {
    const out = solve(a, b);
    assert.equal(out, expected);
  }
});

test("min-rotations-2: reference check", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    ["abca", "a*bc"],
    ["abcde", "de*ab"],
    ["xyzxyz", "x*yz"],
  ];

  for (const [a, b] of cases) {
    const expected = minRotationsRef(a, b);
    const out = solve(a, b);
    assert.equal(out, expected);
  }
});

test("min-rotations-2: large sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 200000;
  const a = "a".repeat(n);
  const b = "*" + "a".repeat(n - 1);

  const out = solve(a, b);
  assert.equal(out, 0);
});
