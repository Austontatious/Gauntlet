# Challenge 001: Sum Signal

## Problem Statement
Implement a function that returns the sum of all numbers in an array.

## Requirements
- Export a `solve` function from `solution.js`.
- `solve(numbers)` must return the total of all numeric values.
- Support negative numbers.
- Return `0` for an empty array.

## Submission Interface
Your submission **must** include `solution.js` that exports:
- `export function solve(numbers)`

```js
// solution.js
export function solve(numbers) {
  // ...
}
```

## Submission Contract (Gauntlet Standard)
- Submit a directory containing `solution.js` at its root.
- `solution.js` must export a named function `solve` matching the signature below.
- You do **not** submit tests. Gauntlet runs the **official tests bundled with this challenge**.
- During execution, `GAUNTLET_SUBMISSION_DIR` points to your submission root.
  The official tests will import your code from:
  - `${GAUNTLET_SUBMISSION_DIR}/solution.js`
- Your solution must be deterministic and must not read/write files outside `GAUNTLET_SUBMISSION_DIR`.

## Examples

```js
solve([1, 2, 3]) // 6
solve([-2, 5])   // 3
solve([])        // 0
```

## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's `tests/` directory
- `GAUNTLET_SUBMISSION_DIR` points to the submission root
