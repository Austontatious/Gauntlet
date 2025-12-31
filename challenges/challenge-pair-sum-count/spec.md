# Challenge - Pair Sum Count

## Problem Statement
Given an array of integers `arr` and an integer `target`, count the number of index pairs `(i, j)` such that:
- `i < j`
- `arr[i] + arr[j] === target`

## Inputs and Outputs
### Input
- An array of integers `arr`
- An integer `target`

### Output
A single integer: the number of valid pairs.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(arr, target)`

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
- `1 <= arr.length <= 200,000`
- Values fit in 32-bit signed int
- Output fits in 64-bit range
- Expected time complexity: O(n) or O(n log n)
