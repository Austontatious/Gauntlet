# Gauntlet

Gauntlet is a competitive coding arena: publish challenges, accept submissions, run official tests, and rank the results. It is the v0.1 reference implementation for "vibe coding vs pro dev."

## Quickstart

```bash
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm install
cp .env.example .env
./scripts/dev-db.sh
pnpm db:generate
pnpm db:migrate
pnpm seed
pnpm dev:web
pnpm dev:worker
```

Visit `http://localhost:3000`.

To run the scorer locally, set these in `.env`:

```bash
WORKER_ENABLED="true"
RUN_UNTRUSTED_CODE="true"
```

If port 5432 is already in use, start the DB on another port and update
`DATABASE_URL` in `.env` to match:

```bash
PORT=5433 ./scripts/dev-db.sh
```

## Environment Variables

- `DATABASE_URL` (required) -- Postgres connection string.
- `ADMIN_TOKEN` -- token for `/admin/submissions` and admin APIs.
- `UPLOADS_DIR` -- ZIP upload storage (default: `./data/uploads`).
- `RUNS_DIR` -- runner workspace (default: `/tmp/gauntlet/jobs`).
- `WORKER_POLL_INTERVAL_MS` -- polling interval for worker loop.
- `WORKER_MAX_CONCURRENCY` -- max concurrent jobs per worker.
- `WORKER_WATCHDOG_INTERVAL_MS` -- watchdog interval for stale jobs.
- `MAX_JOB_RUNTIME_MS` -- hard runtime cap per job.
- `WORKER_ENABLED` -- master kill switch for the worker.
- `RUN_UNTRUSTED_CODE` -- explicit allow for execution.
- `SUBMISSION_RATE_LIMIT_IP` -- per-IP submission cap.
- `SUBMISSION_RATE_LIMIT_USER` -- per-display-name submission cap.
- `DOCKER_NODE_IMAGE` -- container image for scoring.

## Database

- `pnpm db:migrate` -- create/apply migrations in dev.
- `pnpm db:deploy` -- apply migrations (prod).
- `pnpm db:studio` -- inspect DB.

## Local Smoke Test

With the web + worker running, submit the included fixture and watch status move
from QUEUED to RUNNING to COMPLETE/FAILED.

```bash
python3 - <<'PY'
import zipfile
with zipfile.ZipFile('/tmp/gauntlet-solution.zip', 'w') as z:
    z.write(
        'challenges/fixtures/challenge-001-solution/src/solution.js',
        'src/solution.js',
    )
PY
curl -s \\
  -F "challengeSlug=challenge-001" \\
  -F "displayName=Local Smoke" \\
  -F "methodUsed=VIBE" \\
  -F "submitType=ZIP_UPLOAD" \\
  -F "zipFile=@/tmp/gauntlet-solution.zip" \\
  http://localhost:3000/api/submissions

# Poll until status is COMPLETE or FAILED.
curl -s http://localhost:3000/api/submissions/<id>
```

## Challenges

- Challenge assets live under `challenges/`.
- `pnpm seed` seeds Challenge 001.
- `pnpm create-challenge <slug>` scaffolds a new challenge folder.

## Running the Apps

- `pnpm dev:web` -- Next.js UI + API.
- `pnpm dev:worker` -- local scorer worker.

The worker consumes jobs created by `/api/submissions` and updates submission results.

## Tests

- `pnpm test` -- unit tests (core package).
- `pnpm test:e2e` -- Playwright smoke tests (requires running DB + seeded data).

## CI

GitHub Actions runs lint, typecheck, unit tests, and Playwright smoke tests against a Postgres service.

## Security Disclaimer

The local runner executes untrusted code. v0.1 mitigations include timeouts, file limits, and log truncation, but this is not a hardened sandbox. See `docs/SECURITY.md` for details and future hardening.

## Scoring Safety Switch

Scoring is gated behind two explicit env vars:

- `WORKER_ENABLED` must be `"true"` for the worker to run at all.
- `RUN_UNTRUSTED_CODE` must be `"true"` to allow executing submissions.

To pause scoring immediately, set either variable to `"false"` and redeploy the worker.
Keep secrets out of the worker environment whenever untrusted execution is enabled.

## Docs

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/SECURITY.md`
- `docs/OPERATIONS.md`
- `docs/CONTRIBUTING.md`
- `docs/RUNNER.md`
- `SPEC.md`
