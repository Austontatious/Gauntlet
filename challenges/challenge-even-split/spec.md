# Challenge - Even Split

## Problem Statement
You are given an integer `total` and an integer `n`. Split `total` into `n` non-negative integers such that:
- The sum of the `n` integers is exactly `total`
- The split is as even as possible (values differ by at most 1)
- If `total` does not divide evenly, earlier indices get the extra 1

## Inputs and Outputs
### Input
Two integers: `total` and `n`.

### Output
An array of `n` integers representing the split.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(total, n)`

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
- During execution, `GAUNTLET_SUBMISSION_DIR` points to the submission root

## Constraints
- `0 <= total <= 1,000,000,000`
- `1 <= n <= 100,000`
- Expected time complexity: O(n)
