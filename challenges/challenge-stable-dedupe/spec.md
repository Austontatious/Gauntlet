# Challenge - Stable Dedupe

## Problem Statement
Given an array of strings, return a new array with duplicates removed while preserving the order of first occurrence.

A string is considered a duplicate only if it matches another string exactly.

## Inputs and Outputs
### Input
An array of strings `lines`.

### Output
An array of strings containing only the first occurrence of each unique string, in original order.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(lines)`

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
- `0 <= lines.length <= 200,000`
- Total characters across all lines <= ~10MB
- Expected time complexity: O(n)
