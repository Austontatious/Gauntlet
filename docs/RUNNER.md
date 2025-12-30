# Runner

## Local Runner (v0.1)

The worker scores submissions locally inside a Docker sandbox. Docker is
required; if unavailable, the worker refuses to execute untrusted code.

### Contract

- Submissions are either:
  - Public GitHub repo URL, or
  - ZIP archive uploaded to `UPLOADS_DIR`.
- Tests live in `challenges/<slug>/tests` and are named `*.test.js` so the runner can discover them.
- Include `gauntlet-reporter.mjs` in the tests folder.
- Tests are executed with Node's test runner using a custom reporter:

```
node --test --test-reporter=gauntlet-reporter.mjs <test files>
```

The reporter writes JSON to `GAUNTLET_TEST_OUTPUT` for parsing.

### Limits

- Max runtime: `MAX_JOB_RUNTIME_MS` (default 5000ms)
- ZIP size limit: `MAX_ZIP_BYTES` (default 20MB)
- Unzipped size limit: `MAX_UNZIPPED_BYTES` (default 50MB)
- Workspace size limit: 50MB
- File count limit: `MAX_FILE_COUNT` (default 2000)
- Bounded concurrency: `WORKER_MAX_CONCURRENCY` (default 1)

These values are configurable per challenge in `scoring.json`.

### Sandbox Details

- Docker image: `node:22-slim` (override with `DOCKER_NODE_IMAGE`)
- No outbound network (`--network none`)
- Read-only root filesystem + `/tmp` tmpfs
- Per-job workspace mounted at `/work`
- Env provided to tests:
  - `GAUNTLET_SUBMISSION_DIR=/work/submission`
  - `GAUNTLET_TEST_OUTPUT=/work/run/test-results.json`

If a submission needs dependencies, `npm install` is run inside the container.
With network disabled, submissions should avoid external downloads.

## v0.2: GitHub Actions Runner

Planned flow:

1. Web app creates a signed job payload.
2. GitHub Actions runner pulls payload and checks out submission.
3. Tests run in a sealed environment.
4. Runner posts results back via webhook.

This removes local execution risk and enables horizontal scaling.
