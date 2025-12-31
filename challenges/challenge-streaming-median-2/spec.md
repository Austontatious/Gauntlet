# Challenge - Streaming Median 2

## Problem Statement
Given an integer array and a window size `k`, compute the median of every contiguous window of length `k`. For even `k`, use the lower median (the element at index `(k-1)/2` in sorted order).

Your algorithm must support deletions as the window slides and run in O(n log n).

## Inputs and Outputs
### Input
- Integer array `arr`.
- Integer `k`.

### Output
An array of medians, one for each window.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(arr, k)`

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
- `arr.length <= 300,000`
- `1 <= k <= arr.length`
- Expected time complexity: O(n log n)
- Must be deterministic
