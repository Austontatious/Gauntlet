# Challenge - Interval Coverage

## Problem Statement
You are given an array of closed integer intervals `[l, r]` (inclusive).
Return the number of integer points covered by at least one interval.

Example: `[1,3]` covers points `{1,2,3}`.

## Notes
- We count integer points, and intervals are closed and inclusive.
- Intervals are not guaranteed to be sorted.
- Two intervals are connected if they overlap or touch.
- Example: `[1,2]` and `[3,4]` cover `{1,2,3,4}` for a total of 4 points.
- When merging sorted intervals, start a new segment only if `l > curR + 1`.

## Inputs and Outputs
### Input
An array of intervals `intervals`, where each interval is a 2-element array `[l, r]`.

### Output
Return a BigInt: the number of covered integer points.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(intervals)`

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
- `1 <= intervals.length <= 200,000`
- `-1e9 <= l <= r <= 1e9`
- Expected time complexity: O(n log n)
- Output fits in 64-bit integer range
