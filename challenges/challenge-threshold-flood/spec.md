# Challenge - Threshold Flood

## Problem Statement
You are given a 2D grid of integers and a list of queries.
For each query `(r, c, t)`, starting from cell `(r, c)` you may move up/down/left/right to adjacent cells,
but you may only step onto cells whose value is **at least `t`**.

Return, for each query, the number of reachable cells (including the start cell if it qualifies).

If the start cell value is `< t`, the reachable size is `0`.

## Inputs and Outputs
### Input
- `grid`: a 2D array of integers
- `queries`: an array of `[r, c, t]` (0-indexed)

### Output
An array of integers of length `queries.length`.

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
- `GAUNTLET_SUBMISSION_DIR` points to the submission root

## Constraints
- Total cells `H*W <= 200,000`
- `1 <= queries.length <= 200,000`
- Values fit in 32-bit signed int
- Deterministic logic only
- Avoid recursion (stack safety)
