# Gauntlet Challenge Format Specification (v0.1)

This document defines the required structure, constraints, and guarantees for
writing challenges that run on the Gauntlet platform. Challenges that conform
to this spec:

- Run deterministically in Gauntlet's sandbox.
- Are safe to execute as untrusted code.
- Are scorable automatically.
- Are comparable across submissions.

If a solution passes the official tests locally under the same runtime, it will
pass on Gauntlet. That sentence is deliberately true by construction.

## 1. High-Level Challenge Model

A Gauntlet challenge consists of:

- Human-readable specification (Markdown)
- Test suite (Node 22+, `node --test`)
- Metadata (slug, difficulty, scoring flags)
- Execution contract (what the solution must expose)

## 2. Required Directory Structure

Each challenge lives in its own folder:

```
challenges/
└── challenge-<slug>/
    ├── spec.md
    ├── metadata.json
    ├── tests/
    │   ├── test-*.js
    │   └── helpers.js (optional)
    └── README.md (optional, author notes)
```

Naming rules:

- `<slug>` must be lowercase, URL-safe, and unique.
- Tests must be `.js` and compatible with Node 22+.

## 3. Challenge Specification (spec.md)

Required sections (in this order):

1. Title
2. Problem Statement
3. Inputs and Outputs
4. Execution Environment (Guaranteed)
5. Constraints

### 1. Title

```
# Challenge 001 - Example Title
```

### 2. Problem Statement

- Describe what must be built, not how.
- Avoid hints that encode a solution.
- Be unambiguous.

### 3. Inputs and Outputs

Clearly define:

- What the solution receives.
- What it must return or produce.

Example:

```
## Input
An array of integers.

## Output
A single integer representing the maximum sum.
```

### 4. Execution Environment (Guaranteed)

This section is mandatory and standardized.

```
## Execution Environment (Guaranteed)
- Runtime: Node.js 22+
- Test runner: node --test
- Official tests are located in this challenge's tests/ directory
- During execution, the environment variable GAUNTLET_SUBMISSION_DIR points to
  the root directory of the submitted solution
```

Authors must not assume any other globals, services, or files.

### 5. Constraints

Include:

- Time complexity expectations
- Memory expectations
- Edge cases

Example:

```
## Constraints
- Input size <= 100,000
- Solution must complete within milliseconds
- No network access is available
```

## 4. Metadata (metadata.json)

Required shape:

```json
{
  "slug": "challenge-001",
  "title": "Example Challenge",
  "difficulty": "beginner",
  "category": "algorithms",
  "maxRuntimeMs": 5000,
  "scoring": {
    "correctness": true,
    "buildTime": true,
    "executionTime": false
  }
}
```

Fields:

- `difficulty`: `beginner` | `intermediate` | `advanced` | `expert`
- `maxRuntimeMs`: hard timeout enforced by platform
- `scoring` flags must match what the platform supports
- v0.1 rule: `executionTime` may be ignored or informational only

## 5. Test Suite Rules (tests/)

Test runner:

- Must use Node's built-in test runner: `node --test`

What tests may do:

- Import user code
- Read files inside `GAUNTLET_SUBMISSION_DIR`
- Use deterministic logic
- Fail loudly and clearly

What tests must NOT do:

- Make network requests
- Read outside the submission directory
- Depend on wall-clock time
- Depend on randomness without a fixed seed

## 6. Submission Interface (Critical)

How tests locate user code:

All tests must locate the solution relative to
`process.env.GAUNTLET_SUBMISSION_DIR`.

Example:

```js
import path from "node:path";

const solutionPath = path.join(
  process.env.GAUNTLET_SUBMISSION_DIR,
  "solution.js"
);

const { solve } = await import(solutionPath);
```

Author rule:

Never assume a specific filename unless you explicitly require it in `spec.md`.
If you require:

- `solution.js`
- `index.js`
- exported function name

You must say so clearly in `spec.md`.

## 7. Scoring Rules (v0.1)

All challenges must conform to this model:

- Correctness: determined solely by test pass/fail. Partial credit is not
  supported in v0.1.
- Build-Time (Honor System): participants self-report how long it took to write
  the solution. No enforcement in v0.1. May be verified in later versions via
  monitored environments.
- Execution Time: not ranked in v0.1. Only enforced as a safety cutoff
  (`maxRuntimeMs`).

## 8. Platform Behavior (Author Awareness)

Challenge authors should assume:

- Submissions run in a sandbox
- No outbound network access
- Hard runtime kill at `maxRuntimeMs`
- Jobs may be canceled automatically
- Submissions may be rate-limited

Authors must not rely on:

- Global state
- Persistent storage
- External APIs
- Filesystem outside the submission dir

## 9. What Makes a "Good" Gauntlet Challenge

Good:

- Clear problem, minimal ambiguity
- Deterministic tests
- Finishes well under timeout
- Rewards correctness and clarity
- Does not leak solution through tests

Avoid:

- "Trick" problems that rely on environment quirks
- Tests that introspect implementation details
- Problems that require internet or large datasets

## 10. Versioning and Forward Compatibility

This spec is v0.1. Future versions may add:

- Execution-time scoring
- Memory scoring
- Monitored build environments
- Language variants

Challenge authors should not depend on undocumented behavior.
