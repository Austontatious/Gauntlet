# Operations

## Environment Variables

- `DATABASE_URL` -- Postgres connection string.
- `ADMIN_TOKEN` -- admin view and seed endpoint access.
- `UPLOADS_DIR` -- ZIP upload directory.
- `RUNS_DIR` -- runner workspace.
- `WORKER_POLL_INTERVAL_MS` -- worker loop interval.
- `WORKER_MAX_CONCURRENCY` -- max concurrent jobs per worker.
- `WORKER_WATCHDOG_INTERVAL_MS` -- watchdog interval for stale jobs.
- `MAX_JOB_RUNTIME_MS` -- hard runtime cap per job.
- `MAX_ZIP_BYTES` -- upload size cap.
- `MAX_UNZIPPED_BYTES` -- extracted size cap.
- `MAX_FILE_COUNT` -- max files per submission.
- `WORKER_ENABLED` -- master kill switch for the worker.
- `RUN_UNTRUSTED_CODE` -- explicit allow for execution.
- `SUBMISSION_RATE_LIMIT_IP` -- per-IP submission cap (default 10/hour).
- `SUBMISSION_RATE_LIMIT_USER` -- per-display-name cap (default 20/day).
- `DOCKER_NODE_IMAGE` -- container image for scoring (`node:22-slim` default).

## Deployment Notes

- Deploy `apps/web` and `apps/worker` separately.
- Ensure the worker has access to `RUNS_DIR` and `UPLOADS_DIR`.
- Docker must be available for the worker; otherwise it will refuse to execute.
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
