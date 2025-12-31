# Challenge - Even Split 2

## Problem Statement
You are given an integer `total`, an integer `n`, and a list of locked index/value pairs. Construct an array `parts` of length `n` such that:
- All values are non-negative integers.
- `sum(parts) == total`.
- Every locked pair `[idx, value]` is satisfied exactly: `parts[idx] == value`.
- The remaining free indices are as even as possible:
  - Among free indices, `max - min <= 1`.
  - Earlier free indices (by index order) receive the extra 1s.

If the requirements are impossible (invalid locks, duplicate indices, negative values, or locked sum exceeding `total`), return `null`.

## Inputs and Outputs
### Input
- Integer `total`.
- Integer `n`.
- Array `locked`, containing pairs `[idx, value]`.

### Output
An array of length `n` satisfying the rules, or `null` if impossible.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(total, n, locked)`

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
  points to the submission root

## Constraints
- `0 <= total <= 1,000,000,000`
- `1 <= n <= 200,000`
- `locked.length <= n`
- Expected time complexity: O(n)
