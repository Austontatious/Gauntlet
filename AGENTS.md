# AGENTS.md — Gauntlet Platform Rules

This repository is part of the **Gauntlet coding challenge platform**.
Automated agents (Codex, Cursor, SWE agents, etc.) must follow these rules strictly.

## 1. Canonical Submission Contract (DO NOT VIOLATE)
- Challenge submissions consist of **solution.js only**, exporting `solve(...)`.
- Users do NOT submit tests.
- Official tests live in this repository under:
  `challenges/challenge-<slug>/tests/`
- Tests import user code from:
  `${GAUNTLET_SUBMISSION_DIR}/solution.js`

Do NOT:
- create or modify `solution.test.js`
- move tests into submissions
- invent alternative layouts

## 2. Canonical Challenge Layout (READ-ONLY unless explicitly instructed)
challenges/
challenge-<slug>/
spec.md
metadata.json
tests/

markdown
Copy code

If a challenge’s tests are missing or mislocated:
- This is a **platform configuration error**
- Report it explicitly
- DO NOT patch around it

## 3. Cross-Project Isolation

When working inside this repository, treat it as the **sole source of truth**.

Do NOT:
- read from or modify other Gauntlet-related repositories (e.g. `/Gauntlet`, `/Gauntlet-*`)
- copy files, tests, or structure from sibling projects
- infer behavior by inspecting external repos

If required information is missing or ambiguous:
- stop
- report the issue
- request clarification

Do NOT patch around missing configuration by importing or duplicating data from another project.

## 4. Failure Semantics
If:
- official tests are missing
- paths do not match the canonical layout
- required files are absent

You must:
- stop
- explain the issue
- request clarification

Do NOT invent files, copy tests, or “make it work.”

## 5. Verification Before Completion
Before marking work complete:
- Ensure filesystem layout matches the contract
- Ensure `solution.js` is the only required submission artifact
- Run the build/test steps specified in the instructions
- If something cannot be verified, say so explicitly

## 6. Priority
Instructions in this file override:
- agent defaults
- general coding heuristics
- “best effort” repair behavior

When in doubt, **preserve contract correctness over task completion**.
