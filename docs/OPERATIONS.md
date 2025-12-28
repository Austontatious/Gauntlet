# Operations

## Environment Variables

- `DATABASE_URL` -- Postgres connection string.
- `ADMIN_TOKEN` -- admin view and seed endpoint access.
- `UPLOADS_DIR` -- ZIP upload directory.
- `RUNS_DIR` -- runner workspace.
- `WORKER_POLL_INTERVAL_MS` -- worker loop interval.

## Deployment Notes

- Deploy `apps/web` and `apps/worker` separately.
- Ensure the worker has access to `RUNS_DIR` and `UPLOADS_DIR`.
- Store ZIP uploads on persistent storage if running across multiple hosts.

## Database

- Use managed Postgres in production.
- Schedule regular backups (daily or hourly depending on throughput).
- Monitor connection counts; Prisma defaults can exhaust small plans.

## Worker Scaling

- Horizontal scaling is supported by job locking.
- Increase `WORKER_POLL_INTERVAL_MS` if DB load is high.
- Consider queue backpressure and retry logic for long-running jobs.

## Runner Future Path

- v0.2 moves scoring to GitHub Actions or a sandboxed runner fleet.
- See `docs/RUNNER.md` for contract details.
