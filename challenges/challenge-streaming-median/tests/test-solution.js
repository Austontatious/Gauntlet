import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { runRef } from "./helpers.js";

test("streaming-median: exports solve(ops)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("streaming-median: example-like behavior", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const ops = ["+ 5", "+ 2", "?", "+ 9", "?", "- 5", "?"];
  const expected = runRef(ops);
  const out = solve(ops);
  assert.deepEqual(out, expected);
});

test("streaming-median: deterministic stress vs ref (moderate)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const ops = [];
  const bag = [];
  function ins(x) {
    ops.push(`+ ${x}`);
    bag.push(x);
  }
  function del(x) {
    ops.push(`- ${x}`);
    const i = bag.indexOf(x);
    bag.splice(i, 1);
  }

  for (let i = 1; i <= 2000; i++) ins((i * 17) % 101);
  for (let i = 0; i < 1000; i++) ops.push("?");
  for (let i = 0; i < 1500; i++) {
    const x = bag[(i * 31) % bag.length];
    del(x);
    if (i % 3 === 0) ops.push("?");
    ins((i * 29) % 97);
  }

  const expected = runRef(ops);
  const out = solve(ops);
  assert.deepEqual(out, expected);
});
