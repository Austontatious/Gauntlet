# Gauntlet

Gauntlet is a competitive coding arena: publish challenges, accept submissions, run official tests, and rank the results. It is the v0.1 reference implementation for "vibe coding vs pro dev."

## Quickstart

```bash
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm install
cp .env.example .env
./scripts/dev-db.sh
pnpm db:push
pnpm seed
pnpm dev:web
pnpm dev:worker
```

Visit `http://localhost:3000`.

## Environment Variables

- `DATABASE_URL` (required) -- Postgres connection string.
- `ADMIN_TOKEN` -- token for `/admin/submissions` and admin APIs.
- `UPLOADS_DIR` -- ZIP upload storage (default: `./data/uploads`).
- `RUNS_DIR` -- runner workspace (default: `./data/runs`).
- `WORKER_POLL_INTERVAL_MS` -- polling interval for worker loop.

## Database

- `pnpm db:push` -- apply schema to dev DB.
- `pnpm db:migrate` -- create a migration (optional in v0.1).
- `pnpm db:studio` -- inspect DB.

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

## Docs

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/SECURITY.md`
- `docs/OPERATIONS.md`
- `docs/CONTRIBUTING.md`
- `docs/RUNNER.md`
- `SPEC.md`
