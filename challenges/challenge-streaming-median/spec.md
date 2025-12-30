# Challenge - Streaming Median With Deletions

## Problem Statement
Maintain a multiset of integers under operations:

- "+ x": insert `x`
- "- x": remove one occurrence of `x` (guaranteed to exist)
- "?": output the current median

Median rule:
- If size is odd, median is the middle element when sorted
- If size is even, median is the lower median (the left of the two middles)

Return an array containing the medians for each "?" operation in order.

## Inputs and Outputs
### Input
An array of operation strings `ops`.

### Output
An array of integers (medians).

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(ops)`

## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's `tests/` directory
- `GAUNTLET_SUBMISSION_DIR` points to the submission root

## Constraints
- `1 <= ops.length <= 300,000`
- Values fit in 32-bit signed int
- "?" is only issued when multiset is non-empty
- Deterministic logic only
