import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mirrorRef, hasDoubleSpaceOutsideQuotes } from "./helpers.js";

test("mirror-words-2: exports solve(s)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("mirror-words-2: basic cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const cases = [
    ["hello \"big world\" ok", "olleh \"dlrow gib\" ko"],
    [" \"a  b\"  c ", "\"b  a\" c"],
    ["one \"two\" \"three  four\" five", "eno \"owt\" \"ruof  eerht\" evif"],
    ["\"\"", "\"\""],
    ["\"\"  a", "\"\" a"],
  ];

  for (const [input, expected] of cases) {
    const out = solve(input);
    assert.equal(typeof out, "string");
    assert.equal(out, expected);
  }
});

test("mirror-words-2: large input with quotes", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  let s = "";
  for (let i = 0; i < 20000; i++) {
    s += `w${i}  \"a  b ${i}\"   z${i} `;
  }

  const expected = mirrorRef(s);
  const out = solve(s);
  assert.equal(out, expected);
  assert.equal(hasDoubleSpaceOutsideQuotes(out), false, "No double spaces outside quotes");
});
