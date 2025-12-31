# Challenge - Minimal Rotations

## Problem Statement
Given two strings `a` and `b` of equal length, you may rotate `a` left any number of times.
A left rotation moves the first character to the end.

Return the minimum number of left rotations needed to make `a === b`, or `-1` if it is impossible.

## Inputs and Outputs
### Input
Two strings `a` and `b`.

### Output
An integer: minimum rotations, or `-1`.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(a, b)`

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
- `1 <= a.length = b.length <= 200,000`
- Expected time complexity: O(n) or O(n log n)
- Deterministic logic only
