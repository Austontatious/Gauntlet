# Challenge - Log Parse 2

## Problem Statement
You are given log lines describing events for multiple sessions. Each line has the format:
`<ts> <sessionId> <event> [value]`

Where `event` is one of:
- `START`
- `SCORE <int>`
- `END`

Sessions can interleave. A session is valid if it has `START`, then zero or more `SCORE`, then `END`.
Ignore events for sessions that are not currently started.

Return session summaries in the order their `END` events occur.

Each summary is:
`{ sessionId: string, durationMs: number, totalScore: number }`

Where `durationMs = END.ts - START.ts`.

## Inputs and Outputs
### Input
An array of log lines as strings.

### Output
An array of session summary objects in end order.

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
- `lines.length <= 300,000`
- Expected time complexity: O(n)
- Must be deterministic
