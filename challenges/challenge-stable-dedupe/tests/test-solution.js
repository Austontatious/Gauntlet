import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { stableUniqueRef } from "./helpers.js";

test("stable-dedupe: exports solve(lines)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("stable-dedupe: cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [["ERR disk", "OK boot", "ERR disk", "WARN fan", "OK boot", "OK ready"], ["ERR disk", "OK boot", "WARN fan", "OK ready"]],
    [["a", "a", "a"], ["a"]],
    [["a", "A", "a "], ["a", "A", "a "]],
    [[], []],
  ];

  for (const [lines, expected] of cases) {
    const out = solve(lines);
    assert.ok(Array.isArray(out), "Output must be an array");
    assert.deepEqual(out, expected);
  }
});

test("stable-dedupe: large sanity vs reference", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const lines = [];
  for (let i = 0; i < 100000; i++) {
    lines.push("x" + (i % 5000));
  }
  const expected = stableUniqueRef(lines);
  const out = solve(lines);
  assert.deepEqual(out, expected);
});
