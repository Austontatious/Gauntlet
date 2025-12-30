# Architecture

## System Overview

```
+------------------+           +------------------------+
|  Next.js Web     |           |  Runner (apps/worker)  |
|  UI + API        |           |  Job Poller + Scorer   |
+--------+---------+           +-----------+------------+
         |                                     |
         | (SQL)                               | (git/zip + tests)
         v                                     v
+------------------+           +------------------------+
|   Postgres DB    |           |   Local Runner FS      |
|  Prisma ORM      |           |  data/runs + uploads   |
+------------------+           +------------------------+
```

## Components

- **apps/web**: Next.js App Router app. Hosts UI, API routes, and renders challenge specs.
- **apps/worker**: Background runner that polls queued jobs, runs tests, and updates submissions.
- **packages/core**: Shared types, leaderboard sorting, scoring output parsing.
- **challenges/**: Versioned challenge specs, tests, and scoring config.
- **prisma/**: Database schema and migrations.

## Data Model (v0.1)

```
Challenge
- id, slug, title, shortDescription
- specMarkdownPath, scoringConfig
- visibility, createdAt

Submission
- id, challengeId, displayName
- methodUsed, selfReportedMinutes
- submitType, repoUrl, zipPath
- status, result, logExcerpt, commitHash
- createdAt, updatedAt

Job
- id, type, payload
- status, lockedAt, lockedBy, attempts
- startedAt, finishedAt, timeoutAt
- cancelReason, runnerHandle
- createdAt, updatedAt
```

## Submission Data Flow

1. User submits repo URL or ZIP in the UI.
2. `/api/submissions` validates input, writes submission to Postgres, queues a Job.
3. Worker picks up `SCORE_SUBMISSION` job and sets submission to RUNNING.
4. Runner prepares source (clone/unzip), blocks outbound network, runs `node --test`.
5. Runner writes results JSON and returns logs + runtime metrics.
6. Worker persists results, updates submission status, and marks job COMPLETE/FAILED.
7. Leaderboard queries sort by correctness, runtime, and deterministic tie-breaker.

Leaderboard ranking (deterministic tie-breaker):
- Highest passRate
- Lowest runtimeMs
- Earliest submission (createdAt ascending)

## Why Next.js + Worker

- Next.js provides fast UI + API co-location with App Router.
- A separate runner isolates untrusted execution from UI traffic.
- Prisma keeps DB access consistent across both surfaces.

## Boundaries

- **Web app**: UI, submission intake, leaderboard queries.
- **Worker**: execution, scoring, log capture, job state changes.
- **Core**: shared scoring and ranking logic.
