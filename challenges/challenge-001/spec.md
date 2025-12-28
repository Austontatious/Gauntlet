# Challenge 001: Sum Signal

## Objective
Implement a function that returns the sum of all numbers in an array.

## Requirements
- Export a `sum` function from `src/solution.js`.
- `sum(numbers)` must return the total of all numeric values.
- Support negative numbers.
- Return `0` for an empty array.

## Interface

```js
// src/solution.js
function sum(numbers) {
  // ...
}

module.exports = { sum };
```

## Examples

```js
sum([1, 2, 3]) // 6
sum([-2, 5])   // 3
sum([])        // 0
```

## Notes
- The official tests are in `challenges/challenge-001/tests`.
- The runner sets `GAUNTLET_SUBMISSION_DIR` so tests can locate your code.
- Use Node 22+ and run tests via `node --test`.
