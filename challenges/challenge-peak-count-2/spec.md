# Challenge - Peak Count 2

## Problem Statement
Given an integer array, count the number of peak plateaus. A plateau is a maximal contiguous segment of equal values. A plateau is a peak if it is higher than the nearest different neighbors on both sides.

More precisely:
- Find each maximal segment `[i..j]` with the same value `v`.
- It is a peak plateau if:
  - The segment does not touch the ends (`i > 0` and `j < n - 1`).
  - `v` is greater than both `arr[i - 1]` and `arr[j + 1]`.

Return the number of peak plateaus.

## Inputs and Outputs
### Input
An array of integers `arr`.

### Output
An integer: the number of peak plateaus.

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
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `arr.length` <= 200,000
- Expected time complexity: O(n)
- Must be deterministic
