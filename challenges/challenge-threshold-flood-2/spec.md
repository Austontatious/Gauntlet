# Challenge - Threshold Flood 2

## Problem Statement
You are given a grid of integers and many queries of the form `[r, c, t]`. For each query, count how many cells are reachable from `(r, c)` using 4-directional moves, moving only through cells with value `>= t`.

Constraints are large, so you must answer all queries efficiently using an offline approach (e.g., sorting cells and queries and union-find).

## Inputs and Outputs
### Input
- 2D array `grid` of integers.
- Array `queries`, where each entry is `[r, c, t]`.

### Output
An array of integers, one per query, in the same order.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(grid, queries)`

## Submission Contract (Gauntlet Standard)
- Submit a directory containing `solution.js` at its root.
- `solution.js` must export a named function `solve` matching the signature below.
- You do **not** submit tests. Gauntlet runs the **official tests bundled with this challenge**.
- During execution, `GAUNTLET_SUBMISSION_DIR` points to your submission root.
  The official tests will import your code from:
  - `${GAUNTLET_SUBMISSION_DIR}/solution.js`
- Your solution must be deterministic and must not read/write files outside `GAUNTLET_SUBMISSION_DIR`.

## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's `tests/` directory
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `H * W <= 200,000`
- `queries.length <= 200,000`
- Expected time complexity: O((H*W + q) log (H*W))
- Must be deterministic
- No recursion
