# Deployment Verification Results

## Local Runtime Verification

- Docker Postgres started on port 5433 (port 5432 already in use).
- Prisma generate + migrate + seed completed successfully.
- Web and worker started locally.
- ZIP submission for challenge-001 completed with 4/4 tests passing.

## Render API Verification

- Dry run: existing services + database discovered.
- Deploy: services updated, deploys triggered, both web + worker reached `live`.
- Pause: worker env updated with `WORKER_ENABLED=false`, deploys reached `live`.
- Resume: worker env updated with `WORKER_ENABLED=true` and `RUN_UNTRUSTED_CODE=true`, deploys reached `live`.

Web URL: https://gauntlet-web.onrender.com

## Notes

- Verify worker behavior from Render logs after pause/resume to confirm the guard message and normal polling.
