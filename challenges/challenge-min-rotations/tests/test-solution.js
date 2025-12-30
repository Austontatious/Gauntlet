import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { minRotRef } from "./helpers.js";

test("min-rotations: exports solve(a,b)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("min-rotations: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    ["abcde", "cdeab"],
    ["aaaa", "aaaa"],
    ["abcd", "bcda"],
    ["abcd", "acbd"],
    ["x", "x"],
  ];

  for (const [a, b] of cases) {
    const expected = minRotRef(a, b);
    const out = solve(a, b);
    assert.equal(out, expected);
  }
});

test("min-rotations: large sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const n = 200000;
  const a = "a".repeat(n - 1) + "b";
  const b = "b" + "a".repeat(n - 1);
  const expected = n - 1;
  const out = solve(a, b);
  assert.equal(out, expected);
});
