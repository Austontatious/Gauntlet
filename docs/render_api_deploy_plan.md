# Render API Deployment Plan (Gauntlet)

Plan-only document for managing Gauntlet deployment on Render using Render Blueprints and the Render API.

## Decision: Hybrid (Blueprint + API)

Hybrid is the best fit for Gauntlet:
- Blueprints keep infra-as-code in the repo via render.yaml and auto-sync changes, which is ideal for a reproducible public repo and reviewable infra changes. See Render Blueprints (IaC). https://render.com/docs/infrastructure-as-code
- The Render API is still needed for operational automation like environment variable updates and deploy triggers. Render API overview and auth flow. https://render.com/docs/api

Tradeoffs (Gauntlet-specific):
- Blueprint-first alone is clean and reproducible but less flexible for CI-driven env var changes or scripted deploy triggers.
- API-first alone gives full control but increases drift risk and requires more scripting; it is also less auditable than a render.yaml.
- Hybrid keeps infra declarative while using the API for the operational knobs Gauntlet needs (env var updates, deploy triggers, service discovery).

## Inventory: Required Render Resources

Service types are aligned with Render's service types (web services, background workers, and managed Postgres). https://render.com/docs/service-types

Resources:
- gauntlet-web: Web service (Next.js UI/API)
- gauntlet-worker: Background worker (scorer)
- gauntlet-db: Postgres database
- Optional: env group(s) for shared secrets (DATABASE_URL, shared app secrets)

Workspace/owner placement:
- All resources should be created in the target Render workspace (owner_id). Use the List workspaces endpoint to select the correct owner_id. https://api-docs.render.com/reference/list-owners
- ownerId is required when creating services and Postgres, so the workflow must resolve owner_id before creation. https://api-docs.render.com/reference/create-service https://api-docs.render.com/reference/create-postgres

## Authentication and Workspace Discovery

- API keys are created in the Render dashboard and used for API calls. Render API overview and key creation. https://render.com/docs/api
- Auth is bearer token in the Authorization header; API base URL is https://api.render.com/v1. https://render.com/docs/api
- Discover workspaces with List workspaces (owners) and select the owner_id to scope all creation calls. https://api-docs.render.com/reference/list-owners

## Endpoint Map (Core Reference)

All endpoints are relative to https://api.render.com/v1. https://render.com/docs/api

| Purpose | Method + Path | Required payload fields | Output needed downstream | Notes / idempotency | Docs |
| --- | --- | --- | --- | --- | --- |
| List workspaces | GET /owners | none | ownerId | Select target workspace for all creates | https://api-docs.render.com/reference/list-owners |
| List services | GET /services | none | service.id, name, type, ownerId | Use for service discovery by name | https://api-docs.render.com/reference/list-services |
| Create service | POST /services | type, name, ownerId (plus type-specific config) | service.id | Required fields vary by service type; confirm full payload in API reference | https://api-docs.render.com/reference/create-service |
| Retrieve service | GET /services/{serviceId} | none | repo, autoDeploy, service type | Use to confirm repo linkage and settings | https://api-docs.render.com/reference/retrieve-service |
| Update service | PATCH /services/{serviceId} | none (fields optional) | updated service | Use for config changes and scaling; confirm fields | https://api-docs.render.com/reference/update-service |
| List Postgres | GET /postgres | none | postgres.id, name, ownerId | Discover DB by name | https://api-docs.render.com/reference/list-postgres |
| Create Postgres | POST /postgres | name, plan, ownerId, version | postgres.id | Required fields documented in API reference | https://api-docs.render.com/reference/create-postgres |
| Retrieve Postgres | GET /postgres/{postgresId} | none | postgres metadata | Inspect DB status and settings | https://api-docs.render.com/reference/retrieve-postgres |
| Get Postgres connection info | GET /postgres/{postgresId}/connection-info | none | connection string(s) for DATABASE_URL | Use to wire web + worker | https://api-docs.render.com/reference/retrieve-postgres-connection-info |
| List env vars | GET /services/{serviceId}/env-vars | none | current env var list | Input to safe update merge | https://api-docs.render.com/reference/get-env-vars-for-service |
| Replace env vars | PUT /services/{serviceId}/env-vars | full env var list | updated env var list | Replaces all env vars; missing keys are removed | https://api-docs.render.com/reference/update-env-vars-for-service |
| List env groups | GET /env-groups | none | envGroup.id, name | Service discovery for shared env groups | https://api-docs.render.com/reference/list-env-groups |
| Create env group | POST /env-groups | name, ownerId, envVars | envGroup.id | Use for shared vars across web + worker | https://api-docs.render.com/reference/create-env-group |
| Update env group | PATCH /env-groups/{envGroupId} | name (required) | envGroup | Update metadata; env var update details in API ref | https://api-docs.render.com/reference/update-env-group |
| Link env group to service | POST /env-groups/{envGroupId}/services/{serviceId} | none | link confirmation | Share env vars with service | https://api-docs.render.com/reference/link-service-to-env-group |
| Unlink env group from service | DELETE /env-groups/{envGroupId}/services/{serviceId} | none | link removal | Remove shared env vars | https://api-docs.render.com/reference/unlink-service-from-env-group |
| List blueprints | GET /blueprints | none | blueprint.id | Discover Blueprint created by repo integration | https://api-docs.render.com/reference/list-blueprints |
| Retrieve blueprint | GET /blueprints/{blueprintId} | none | blueprint details | Verify linked repo and render.yaml sync | https://api-docs.render.com/reference/retrieve-blueprint |
| Update blueprint | PATCH /blueprints/{blueprintId} | fields optional | blueprint | Used for blueprint settings updates | https://api-docs.render.com/reference/update-blueprint |
| List blueprint syncs | GET /blueprints/{blueprintId}/syncs | none | sync status | Check render.yaml sync state | https://api-docs.render.com/reference/list-blueprint-syncs |
| List deploys | GET /services/{serviceId}/deploys | none | deploy.id, status | Observe deploy status | https://api-docs.render.com/reference/list-deploys |
| Create deploy | POST /services/{serviceId}/deploys | none required | deploy.id | Trigger deploy after env var update | https://api-docs.render.com/reference/create-deploy |
| Retrieve deploy | GET /services/{serviceId}/deploys/{deployId} | none | deploy status | Verify rollout completion | https://api-docs.render.com/reference/retrieve-deploy |
| Cancel deploy | POST /services/{serviceId}/deploys/{deployId}/cancel | none | cancel status | Emergency stop | https://api-docs.render.com/reference/cancel-deploy |
| Rollback deploy | POST /services/{serviceId}/rollback | none | rollback deploy | Roll back to previous deploy | https://api-docs.render.com/reference/rollback-deploy |

## Build/Start Commands (Gauntlet)

Worker start should run compiled JS in production to avoid a TS runtime compilation dependency.

Render service settings (suggested):

Web service:
- Build: `pnpm install --frozen-lockfile && pnpm build:web`
- Start: `pnpm start:web`

Worker service:
- Build: `pnpm install --frozen-lockfile && pnpm build:worker`
- Start: `pnpm start:worker` (runs `node dist/index.js`)

Inline snippet (for Render UI fields):
```
Web Build Command: pnpm install --frozen-lockfile && pnpm build:web
Web Start Command: pnpm start:web
Worker Build Command: pnpm install --frozen-lockfile && pnpm build:worker
Worker Start Command: pnpm start:worker
```

## Idempotent Deployment Workflow (CI-safe)

1. Read API key from secret store and set Authorization: Bearer. https://render.com/docs/api
2. List workspaces and resolve owner_id for the target workspace. https://api-docs.render.com/reference/list-owners
3. Blueprint-first (hybrid): ensure render.yaml exists in repo and that a Blueprint is connected to the repo; use List blueprints to discover it and verify sync status. https://render.com/docs/infrastructure-as-code https://api-docs.render.com/reference/list-blueprints https://api-docs.render.com/reference/list-blueprint-syncs
4. If no Blueprint exists, fall back to API-first creation for services and Postgres using owner_id; this should be treated as a one-time bootstrap path. https://api-docs.render.com/reference/create-service https://api-docs.render.com/reference/create-postgres
5. Service discovery: list services and Postgres and map names to IDs; create any missing resources. https://api-docs.render.com/reference/list-services https://api-docs.render.com/reference/list-postgres
6. Fetch Postgres connection info and compute DATABASE_URL to apply to web + worker env vars. https://api-docs.render.com/reference/retrieve-postgres-connection-info
7. Update env vars using the safe replace-all algorithm (see below), then trigger deploys for web + worker. https://api-docs.render.com/reference/get-env-vars-for-service https://api-docs.render.com/reference/update-env-vars-for-service https://api-docs.render.com/reference/create-deploy
8. Poll deploy status until both services report success; if deploy fails, consider rollback. https://api-docs.render.com/reference/retrieve-deploy https://api-docs.render.com/reference/rollback-deploy

## Environment Variable Strategy

Option A: Manage env vars directly per service using the service env var endpoints. https://api-docs.render.com/reference/get-env-vars-for-service https://api-docs.render.com/reference/update-env-vars-for-service

Option B: Use env groups for shared variables (DATABASE_URL, ADMIN_TOKEN, etc.), and link each service to the env group. https://api-docs.render.com/reference/create-env-group https://api-docs.render.com/reference/link-service-to-env-group

Safe update algorithm (avoids accidental deletion):
1. Read current env vars with GET /services/{serviceId}/env-vars. https://api-docs.render.com/reference/get-env-vars-for-service
2. Merge desired changes into the current set by key name.
3. PUT the full merged list back to /services/{serviceId}/env-vars; any omitted key will be removed, so never send a partial list. https://api-docs.render.com/reference/update-env-vars-for-service
4. Trigger a deploy to apply changes because env var updates do not automatically deploy. https://api-docs.render.com/reference/update-env-vars-for-service https://api-docs.render.com/reference/create-deploy

## DB Initialization and Migrations

Dev vs prod commands:

Dev:
- `pnpm db:migrate` (Prisma migrate dev)

Prod:
- `pnpm db:deploy` (Prisma migrate deploy)
- `pnpm seed`

v0.1 safe approach:
- Use managed Postgres created via Blueprint or API, then run `pnpm db:deploy` and `pnpm seed` as a controlled, operator-invoked step.
- Preferred execution pattern is a one-off job or manual run from Render (verify exact mechanism in Render docs before automating). https://render.com/docs/one-off-jobs
- As a fallback for v0.1, the admin seed endpoint in Gauntlet can run once with a locked-down ADMIN_TOKEN, then disabled. (Document as a risk in SECURITY.md.)

Initial prod bootstrap runbook:
1. Provision Postgres.
2. Run `pnpm db:deploy`.
3. Run `pnpm seed`.
4. Verify challenge #001 exists in the UI.
5. Rotate/lock down ADMIN_TOKEN.

v0.2 hardened approach:
- Add a dedicated release workflow or one-off migration service that runs migrations on deploy, with explicit idempotency and rollback runbooks.
- Gate seed operations behind a separate internal-only path and rotate credentials after seeding.

## Operational Plan

- Deploy triggers: use git push auto deploy or explicitly call the Deploy API for deterministic automation. https://api-docs.render.com/reference/create-deploy
- Env var changes require an explicit deploy call regardless of autoDeploy settings. https://api-docs.render.com/reference/update-env-vars-for-service
- Rollback posture: use the Rollback deploy endpoint and document rollback criteria. https://api-docs.render.com/reference/rollback-deploy
- Worker scaling: adjust worker service settings as needed using service update API (confirm fields in API reference). https://api-docs.render.com/reference/update-service
- Logging and observability: use Render logs and events in the dashboard; add app-level logs for job runs and scoring outcomes.

## Security Plan

- Treat the Render API key as a root secret; store in CI secret manager and rotate regularly. https://render.com/docs/api
- Use a dedicated workspace or team for Gauntlet to limit blast radius. https://api-docs.render.com/reference/list-owners
- Reduce worker privileges where possible and document risk of untrusted code execution; keep worker isolated from admin tokens and nonessential secrets.

## Implementation Backlog

| Priority | Ticket | Goal | Acceptance criteria | Rough effort |
| --- | --- | --- | --- | --- |
| P0 | Blueprint base infra | render.yaml defines web, worker, and Postgres as source of truth | Blueprint connects to repo; render.yaml changes sync and services exist | 1-2 days |
| P0 | Render API automation scripts | Repeatable discovery, env var updates, and deploy triggers | Can run idempotent workflow end-to-end without manual edits | 1-2 days |
| P0 | CI wiring | CI job triggers Render API workflow on main | Deploys web + worker, logs success/failure | 1 day |
| P1 | One-off migration/seed automation | Safe Prisma migrate and seed orchestration | Migration and seed run once per env without drift | 1-2 days |
| P2 | Secret rotation tooling | Scripted rotation and validation for Render API key | Rotation playbook and verification checks | 1 day |

## Unknowns to Confirm

- Exact create-service payload fields for web and background worker (repo settings, build/start commands, and env options) should be verified in the Create service API reference before implementation. https://api-docs.render.com/reference/create-service
- Blueprint creation flow via API is not described here; verify whether initial Blueprint connection must be done via the Render dashboard or if a specific API endpoint exists. https://api-docs.render.com/reference/list-blueprints
- Env group update semantics beyond name updates should be verified in the Update env group API reference before automation. https://api-docs.render.com/reference/update-env-group
