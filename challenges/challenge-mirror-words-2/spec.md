# Challenge - Mirror Words 2

## Problem Statement
You are given a string containing tokens separated by whitespace. Each token is either a normal word (no quotes) or a quoted phrase wrapped in double quotes. Quotes are not escaped and are guaranteed balanced.

Transform the string by:
- Reversing each normal word.
- Reversing each quoted phrase as a whole string (including spaces inside the quotes), while keeping the quotes.
- Preserving token order.
- Normalizing whitespace between tokens to a single space (no leading/trailing spaces).

Spaces inside quoted phrases must be preserved exactly.

## Inputs and Outputs
### Input
A single string `s`.

### Output
A single string after applying the transformations above.

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
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `s.length` <= 400,000
- Expected time complexity: O(n)
- Must be deterministic
