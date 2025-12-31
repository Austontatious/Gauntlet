# Challenge - Stable Dedupe 2

## Problem Statement
Given an array of strings, remove duplicates using a case-folded key while preserving the original string of the first occurrence.

- The deduplication key is `line.toLowerCase()`.
- Spaces and punctuation remain part of the key (they are only lowercased).
- Keep the first occurrence's original string and preserve input order for kept entries.

## Inputs and Outputs
### Input
An array of strings `lines`.

### Output
An array of strings containing the kept originals in stable order.

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
- During execution, `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `lines.length` <= 200,000
- Expected time complexity: O(n)
- Must be deterministic
