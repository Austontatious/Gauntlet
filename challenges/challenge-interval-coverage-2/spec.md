# Challenge - Interval Coverage 2

## Problem Statement
You are given closed integer intervals. Compute:
- `covered`: the number of integer points covered by at least one interval.
- `maxOverlap`: the maximum number of intervals covering any single integer point.

For coverage, adjacent intervals merge: a new covered segment starts only when `l > currentR + 1`.

## Inputs and Outputs
### Input
An array `intervals` of pairs `[l, r]` (inclusive), where `l <= r`.

### Output
An object:
`{ covered: BigInt, maxOverlap: number }`

`covered` must always be a BigInt.

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
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `intervals.length` <= 200,000
- `-1,000,000,000 <= l, r <= 1,000,000,000`
- Expected time complexity: O(n log n)
- Must be deterministic
