# Challenge - Peak Count

## Problem Statement
Count how many elements in an array are "peaks".
An element at index `i` is a peak if it is strictly greater than its immediate neighbors:
`arr[i] > arr[i-1]` and `arr[i] > arr[i+1]`.

## Inputs and Outputs
### Input
An array of integers `arr`.

### Output
An integer: the number of peaks.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(arr)`

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
- Expected time complexity: O(n)
- If `arr.length < 3`, output is `0`
