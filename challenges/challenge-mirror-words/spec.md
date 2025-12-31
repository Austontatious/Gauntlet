# Challenge - Mirror Words

## Problem Statement
Given a string containing words separated by whitespace, reverse each word individually while preserving the original word order.

Whitespace between words should be normalized to a single space in the output (i.e., output words separated by exactly one space, with no leading/trailing spaces).

## Inputs and Outputs
### Input
A single string `s`.

### Output
A single string where each word in `s` is reversed, and words are separated by single spaces.

## Submission Interface
Your submission **must** include `solution.js` that exports:

- `export function solve(s)`

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
- During execution, the environment variable `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `s.length` <= 300,000
- Expected time complexity: O(n)
- Must be deterministic
