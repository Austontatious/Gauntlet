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

## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's `tests/` directory
- During execution, the environment variable `GAUNTLET_SUBMISSION_DIR`
  points to the root directory of the submitted solution

## Constraints
- `s.length` <= 200,000
- Expected time complexity: O(n)
- Must be deterministic
