import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { stableDedupeRef } from "./helpers.js";

test("stable-dedupe-2: exports solve(lines)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("stable-dedupe-2: mixed cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    [["Err", "ERR", " ok", "OK", "Ok "], ["Err", " ok", "Ok "]],
    [["A", "a", "A ", "a "], ["A", "A "]],
    [["  Sp", "  sp", "Sp  "], ["  Sp", "Sp  "]],
  ];

  for (const [lines, expected] of cases) {
    const out = solve(lines);
    assert.deepEqual(out, expected);
  }
});

test("stable-dedupe-2: large sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const lines = [];
  for (let i = 0; i < 200000; i++) {
    const base = `Line-${i % 5000}`;
    lines.push(i % 2 === 0 ? base.toUpperCase() : base.toLowerCase());
  }

  const expected = stableDedupeRef(lines);
  const out = solve(lines);
  assert.deepEqual(out, expected);
});
