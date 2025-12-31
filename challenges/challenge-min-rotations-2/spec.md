# Challenge - Minimal Rotations 2

## Problem Statement
Given two strings `a` and `b` of the same length, you may rotate `a` left by `k` positions. String `b` may contain at most one wildcard segment represented by the character `*`, which matches any (possibly empty) substring.

Return the minimal `k` such that `rotateLeft(a, k)` matches the pattern `b`. If no rotation matches, return `-1`.

If `b` contains no `*`, this reduces to the original rotation matching problem.

## Inputs and Outputs
### Input
Two strings `a` and `b` of the same length.

### Output
The minimal non-negative integer `k` such that the rotated string matches, or `-1` if impossible.

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
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `a.length == b.length <= 200,000`
- Expected time complexity: O(n) or O(n log n)
- Must be deterministic
