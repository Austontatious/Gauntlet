# API

Base URL: `/api`

## GET /api/challenges

Returns public/unlisted challenges.

Response:
```json
[
  {
    "slug": "challenge-001",
    "title": "Challenge 001: Sum Signal",
    "shortDescription": "Implement the sum function with correct edge handling.",
    "visibility": "PUBLIC"
  }
]
```

## GET /api/challenges/:slug

Returns challenge details including spec markdown.

Response:
```json
{
  "slug": "challenge-001",
  "title": "Challenge 001: Sum Signal",
  "shortDescription": "Implement the sum function with correct edge handling.",
  "specMarkdown": "# Challenge 001...",
  "scoringConfig": {
    "testsPath": "tests",
    "maxZipBytes": 20971520,
    "maxFileCount": 2000,
    "installTimeoutMs": 240000,
    "testTimeoutMs": 120000,
    "totalTimeoutMs": 420000
  },
  "visibility": "PUBLIC"
}
```

## GET /api/challenges/:slug/leaderboard

Response:
```json
[
  {
    "submissionId": "cku...",
    "displayName": "Ada",
    "methodUsed": "VIBE",
    "selfReportedMinutes": 42,
    "passRate": 1,
    "testsPassed": 4,
    "testsTotal": 4,
    "runtimeMs": 1200,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "repoUrl": "https://github.com/..."
  }
]
```

## POST /api/submissions

Content-Type: `multipart/form-data`

Fields:
- `challengeSlug` (string)
- `displayName` (string)
- `methodUsed` (VIBE | PRO | MIXED | OTHER)
- `selfReportedMinutes` (number, optional)
- `submitType` (GITHUB_REPO | ZIP_UPLOAD)
- `repoUrl` (required if submitType = GITHUB_REPO)
- `zipFile` (required if submitType = ZIP_UPLOAD)

Response:
```json
{ "id": "cku..." }
```

Errors:
- `429` if submission rate limit is exceeded (per IP and per display name).

## GET /api/submissions/:id

Response:
```json
{
  "id": "cku...",
  "challengeId": "ckc...",
  "displayName": "Ada",
  "methodUsed": "VIBE",
  "selfReportedMinutes": 42,
  "submitType": "GITHUB_REPO",
  "repoUrl": "https://github.com/...",
  "status": "COMPLETE",
  "result": {
    "passRate": 1,
    "testsPassed": 4,
    "testsTotal": 4,
    "runtimeMs": 1200,
    "errorSummary": null
  },
  "logExcerpt": "...",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

## GET /api/health

Returns execution status for the scorer.

Response:
```json
{ "executionEnabled": false }
```

## POST /api/admin/jobs/:id/cancel

Cancel a running job.

Headers:
- `x-admin-token: <ADMIN_TOKEN>`

Body (optional):
```json
{ "reason": "manual_cancel" }
```

Response:
```json
{ "status": "CANCELED" }
```

## POST /api/admin/seed

Token-protected seed endpoint.

Headers:
- `x-admin-token: <ADMIN_TOKEN>`

Response:
```json
{ "ok": true }
```
