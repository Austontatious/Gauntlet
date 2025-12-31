import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { floodRef } from "./helpers.js";

test("threshold-flood-2: exports solve(grid, queries)", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const mod = await import(solutionPath);
  assert.equal(typeof mod.solve, "function", "Expected named export solve in solution.js");
});

test("threshold-flood-2: small cases", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const grid = [
    [5, 1, 4],
    [6, 2, 3],
  ];
  const queries = [
    [0, 0, 4],
    [0, 1, 2],
    [1, 2, 3],
    [1, 0, 7],
  ];

  const expected = floodRef(grid, queries);
  const out = solve(grid, queries);
  assert.deepEqual(out, expected);
});

test("threshold-flood-2: medium deterministic vs ref", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const H = 120;
  const W = 120;
  const grid = Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => (r * 31 + c * 17) % 100),
  );

  const queries = [];
  for (let i = 0; i < 600; i++) {
    const r = (i * 37) % H;
    const c = (i * 91) % W;
    const t = (i * 13) % 100;
    queries.push([r, c, t]);
  }

  const expected = floodRef(grid, queries);
  const out = solve(grid, queries);
  assert.deepEqual(out, expected);
});

test("threshold-flood-2: large performance sanity", async () => {
  const solutionPath = path.join(process.env.GAUNTLET_SUBMISSION_DIR, "solution.js");
  const { solve } = await import(solutionPath);

  const H = 300;
  const W = 300;
  const grid = Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => (r * 19 + c * 23) % 1000),
  );

  const queries = new Array(200000);
  for (let i = 0; i < queries.length; i++) {
    const r = (i * 97) % H;
    const c = (i * 57) % W;
    const t = (i * 29) % 1000;
    queries[i] = [r, c, t];
  }

  const out = solve(grid, queries);
  assert.equal(out.length, queries.length);
  for (let i = 0; i < 20; i++) {
    const [expected] = floodRef(grid, [queries[i]]);
    assert.equal(out[i], expected);
  }
});
