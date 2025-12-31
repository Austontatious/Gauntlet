# Challenge - Pair Sum Count 2

## Problem Statement
Given an integer array and many target sums, count how many index pairs `(i < j)` satisfy `arr[i] + arr[j] == target` for each query.

Return a BigInt count for every target.

## Inputs and Outputs
### Input
- Integer array `arr`.
- Integer array `queries` (targets).

### Output
An array of BigInt counts, one per query, in the same order.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(arr, queries)`

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
- `arr.length` <= 200,000
- `queries.length` <= 50,000
- Values are 32-bit signed integers
- Expected time complexity: better than O(n * q)
- Must be deterministic
