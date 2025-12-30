# Challenge - Interval Coverage

## Problem Statement
You are given an array of closed integer intervals `[l, r]` (inclusive).
Return the number of integer points covered by at least one interval.

Example: `[1,3]` covers points `{1,2,3}`.

## Inputs and Outputs
### Input
An array of intervals `intervals`, where each interval is a 2-element array `[l, r]`.

### Output
A single integer: the count of covered integer points.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(intervals)`

## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's `tests/` directory
- `GAUNTLET_SUBMISSION_DIR` points to the submission root

## Constraints
- `1 <= intervals.length <= 200,000`
- `-1e9 <= l <= r <= 1e9`
- Expected time complexity: O(n log n)
- Output fits in 64-bit integer range
