# Deployment Verification Results

## Local Runtime Verification

- Docker Postgres started on port 5433 (port 5432 already in use).
- Prisma generate + migrate + seed completed successfully.
- Web and runner started locally.
- ZIP submission for challenge-001 completed with 4/4 tests passing.
- Malicious ZIP with infinite loop timed out and was marked FAILED.
- Submission with network access attempts failed with "Network disabled by Gauntlet".
- ZIP path traversal was rejected with "ZIP contains invalid paths".
- Log spam was capped at `MAX_LOG_BYTES` and marked `logsTruncated=true` (verified by lowering
  `MAX_LOG_BYTES` to 1024 for the test).

## Render API Verification

- Not run in this environment. Use `pnpm render:deploy:dry` and `pnpm render:deploy`
  once Render credentials are available.

## Notes

- When running local abuse tests in quick succession, rate limits will trigger 429s unless the
  `x-forwarded-for` header is varied.
