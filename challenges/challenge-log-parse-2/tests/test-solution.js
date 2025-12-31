import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { parseLogsRef } from "./helpers.js";

test("log-parse-2: exports solve(lines)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("log-parse-2: interleaving sessions", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const lines = [
    "0 A START",
    "5 B START",
    "6 A SCORE 10",
    "7 B SCORE 3",
    "8 A END",
    "9 B SCORE 2",
    "12 B END",
    "1 C SCORE 5",
    "2 C END",
    "20 X START",
    "25 X END",
  ];

  const expected = [
    { sessionId: "A", durationMs: 8, totalScore: 10 },
    { sessionId: "B", durationMs: 7, totalScore: 5 },
    { sessionId: "X", durationMs: 5, totalScore: 0 },
  ];

  const out = solve(lines);
  assert.deepEqual(out, expected);
});

test("log-parse-2: deterministic sanity vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const lines = [];
  for (let i = 0; i < 50000; i++) {
    const id = `S${i}`;
    const start = i * 3;
    lines.push(`${start} ${id} START`);
    lines.push(`${start + 1} ${id} SCORE ${i % 7}`);
    lines.push(`${start + 2} ${id} SCORE ${i % 5}`);
    lines.push(`${start + 5} ${id} END`);
  }
  for (let i = 0; i < 10000; i++) {
    lines.push(`${i} Z SCORE 9`);
  }

  const expected = parseLogsRef(lines);
  const out = solve(lines);
  assert.deepEqual(out, expected);
});
