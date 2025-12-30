import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { assertString } from "./helpers.js";

test("mirror-words: exports solve(s)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("mirror-words: basic cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    ["hello world!", "olleh !dlrow"],
    ["   hello   world   ", "olleh dlrow"],
    ["a", "a"],
    ["", ""],
    ["  ", ""],
    ["hi  there   friend", "ih ereht dneirf"],
    ["end.", ".dne"],
  ];

  for (const [input, expected] of cases) {
    const out = solve(input);
    assertString(out, "output");
    assert.equal(out, expected);
  }
});

test("mirror-words: large-ish input shape", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const chunk = "abc def   ghi ";
  const s = chunk.repeat(20000);
  const out = solve(s);
  assertString(out, "output");
  assert.ok(out.startsWith("cba fed ihg"), "Output should reverse words");
  assert.ok(!out.startsWith(" "), "No leading space");
  assert.ok(!out.endsWith(" "), "No trailing space");
  assert.ok(!out.includes("  "), "No double spaces");
});
