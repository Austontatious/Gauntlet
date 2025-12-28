# Runner

## Local Runner (v0.1)

The worker scores submissions locally with a minimal safety envelope.

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

- Install timeout: 4 minutes
- Test timeout: 2 minutes
- ZIP size limit: 20MB
- File count limit: 2000

These values are configurable per challenge in `scoring.json`.

## v0.2: GitHub Actions Runner

Planned flow:

1. Web app creates a signed job payload.
2. GitHub Actions runner pulls payload and checks out submission.
3. Tests run in a sealed environment.
4. Runner posts results back via webhook.

This removes local execution risk and enables horizontal scaling.
