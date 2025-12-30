#!/usr/bin/env node

const API_BASE = 'https://api.render.com/v1';

function parseArgs(argv) {
  const out = {
    dryRun: false,
    keepService: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }

    if (arg === '--keep-service') {
      out.keepService = true;
      continue;
    }

    if (arg === '--help') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return out;
}

function printHelp() {
  console.log('Usage: node scripts/render/migrate.mjs [--dry-run] [--keep-service]');
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function maskValue(key, value) {
  if (!value) return '';
  const sensitive = /token|password|secret|key|url/i.test(key);
  if (!sensitive) return value;
  return `${'*'.repeat(8)}(len=${String(value).length})`;
}

async function fetchJson(path, options = {}) {
  const apiKey = requireEnv('RENDER_API_KEY');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Render API ${res.status} ${res.statusText}: ${text}`);
  }

  if (!text) return null;
  return JSON.parse(text);
}

async function listAll(path, key, query = {}) {
  const items = [];
  let cursor;
  const limit = 100;

  while (true) {
    const params = new URLSearchParams({ ...query, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    const page = await fetchJson(`${path}?${params.toString()}`);
    if (!Array.isArray(page)) {
      throw new Error(`Unexpected list response for ${path}`);
    }

    for (const item of page) {
      items.push(key ? item[key] : item);
    }

    if (page.length < limit) {
      break;
    }

    const lastCursor = page[page.length - 1]?.cursor;
    if (!lastCursor) {
      break;
    }

    cursor = lastCursor;
  }

  return items;
}

function pickOwner(owners, ownerId, ownerName) {
  if (ownerId) {
    const match = owners.find((owner) => owner.id === ownerId);
    if (!match) {
      throw new Error(`Owner id not found: ${ownerId}`);
    }
    return match;
  }

  if (ownerName) {
    const matches = owners.filter(
      (owner) => owner.name.toLowerCase() === ownerName.toLowerCase(),
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      throw new Error(`Multiple owners matched name ${ownerName}`);
    }
    throw new Error(`Owner name not found: ${ownerName}`);
  }

  if (owners.length === 1) {
    return owners[0];
  }

  const available = owners.map((owner) => `${owner.name} (${owner.id})`).join(', ');
  throw new Error(
    `Multiple owners available. Set RENDER_OWNER_ID or RENDER_OWNER_NAME. Available: ${available}`,
  );
}

function mergeEnvVars(existing, updates) {
  const map = new Map();
  for (const entry of existing) {
    if (!entry.key || entry.value === undefined || entry.value === null) {
      throw new Error(`Missing env var value for key ${entry.key ?? '(unknown)'}`);
    }
    map.set(entry.key, entry.value);
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;
    map.set(key, String(value));
  }

  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

async function updateServiceEnvVars(service, updates, dryRun) {
  const existing = await fetchJson(`/services/${service.id}/env-vars`);
  const flattened = existing.map((item) => item.envVar);
  const merged = mergeEnvVars(flattened, updates);

  console.log(`Env vars for ${service.name}:`);
  for (const { key, value } of merged) {
    if (updates[key] !== undefined) {
      console.log(`  set ${key}=${maskValue(key, value)}`);
    }
  }

  if (dryRun) {
    console.log(`DRY RUN: skipping env var update for ${service.name}`);
    return;
  }

  await fetchJson(`/services/${service.id}/env-vars`, {
    method: 'PUT',
    body: JSON.stringify(merged),
  });

  console.log(`Updated env vars for ${service.name}`);
}

async function triggerDeploy(service, dryRun) {
  if (dryRun) {
    console.log(`DRY RUN: skipping deploy for ${service.name}`);
    return null;
  }

  const startedAt = new Date();
  const deploy = await fetchJson(`/services/${service.id}/deploys`, {
    method: 'POST',
  });

  if (deploy?.id) {
    console.log(`Deploy started for ${service.name}: ${deploy.id}`);
    return deploy.id;
  }

  const fallbackId = await findLatestDeployId(service, startedAt);
  if (!fallbackId) {
    throw new Error(`Deploy triggered for ${service.name} but no deploy id returned.`);
  }
  console.log(`Deploy started for ${service.name}: ${fallbackId} (fallback)`);
  return fallbackId;
}

const DEFAULT_TERMINAL_STATUSES = [
  'live',
  'deactivated',
  'build_failed',
  'update_failed',
  'canceled',
  'pre_deploy_failed',
];

async function waitForDeploy(service, deployId, options = {}) {
  if (!deployId) return null;

  const terminal = new Set(options.terminalStatuses ?? DEFAULT_TERMINAL_STATUSES);

  const start = Date.now();
  const timeoutMs = 10 * 60 * 1000;

  while (Date.now() - start < timeoutMs) {
    const deploy = await fetchJson(`/services/${service.id}/deploys/${deployId}`);
    console.log(`Deploy status for ${service.name}: ${deploy.status}`);

    if (terminal.has(deploy.status)) {
      return deploy.status;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Timed out waiting for deploy ${deployId} (${service.name})`);
}

async function findLatestDeployId(service, since) {
  const deploys = await fetchJson(`/services/${service.id}/deploys?limit=20`);
  if (!Array.isArray(deploys) || deploys.length === 0) {
    return null;
  }

  const items = deploys
    .map((item) => item.deploy)
    .filter((deploy) => deploy && deploy.createdAt);

  if (items.length === 0) return null;

  const sinceMs = since ? since.getTime() - 5000 : 0;
  const filtered = items.filter(
    (deploy) => new Date(deploy.createdAt).getTime() >= sinceMs,
  );
  const candidates = filtered.length ? filtered : items;

  candidates.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return candidates[0]?.id ?? null;
}

async function deleteService(service, dryRun) {
  if (!service) return;
  if (dryRun) {
    console.log(`DRY RUN: skipping delete for ${service.name}`);
    return;
  }
  await fetchJson(`/services/${service.id}`, { method: 'DELETE' });
  console.log(`Deleted service ${service.name}`);
}

async function ensurePostgres(databases, name, ownerId, payload, dryRun) {
  const existing = databases.find((entry) => entry.name === name);
  if (existing) return existing;

  if (dryRun) {
    console.log(`DRY RUN: ${name} not found; would create Postgres`);
    return null;
  }

  const created = await fetchJson('/postgres', {
    method: 'POST',
    body: JSON.stringify({
      name,
      ownerId,
      ...payload,
    }),
  });

  if (!created?.id) {
    throw new Error('Create Postgres response missing id');
  }

  console.log(`Created Postgres ${name} (${created.id})`);
  return created;
}

async function waitForPostgresConnection(postgresId) {
  const start = Date.now();
  const timeoutMs = 10 * 60 * 1000;

  while (Date.now() - start < timeoutMs) {
    try {
      const conn = await fetchJson(`/postgres/${postgresId}/connection-info`);
      if (conn?.internalConnectionString || conn?.externalConnectionString) {
        return conn;
      }
    } catch (error) {
      // Retry until the database is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error(`Timed out waiting for Postgres connection info (${postgresId})`);
}

async function createMigrateService(ownerId, name, payload, dryRun) {
  if (dryRun) {
    console.log(`DRY RUN: would create migrate service ${name}`);
    return { service: null };
  }

  const created = await fetchJson('/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'background_worker',
      name,
      ownerId,
      ...payload,
    }),
  });

  const service = created?.service ?? created;
  if (!service?.id) {
    throw new Error(`Create migrate service response missing id for ${name}`);
  }

  if (created?.deployId) {
    console.log(`Create deploy queued for ${name}: ${created.deployId}`);
  }

  console.log(`Created migrate service ${name} (${service.id})`);
  return { service };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const ownerIdEnv = process.env.RENDER_OWNER_ID;
  const ownerName = process.env.RENDER_OWNER_NAME;
  const migrateName = process.env.RENDER_MIGRATE_SERVICE_NAME || 'gauntlet-migrate';
  const workerName =
    process.env.RENDER_RUNNER_SERVICE_NAME ||
    process.env.RENDER_WORKER_SERVICE_NAME ||
    'gauntlet-runner';
  const dbName = process.env.RENDER_POSTGRES_NAME || 'gauntlet-db';

  const repoUrl =
    process.env.RENDER_REPO_URL || 'https://github.com/Austontatious/Gauntlet';
  const repoBranch = process.env.RENDER_REPO_BRANCH || 'main';
  const region = process.env.RENDER_REGION || 'oregon';
  const servicePlan = process.env.RENDER_SERVICE_PLAN || 'starter';
  const postgresPlan = process.env.RENDER_POSTGRES_PLAN || 'free';
  const postgresVersion = process.env.RENDER_POSTGRES_VERSION || '16';

  const owners = await listAll('/owners', 'owner');
  const owner = pickOwner(owners, ownerIdEnv, ownerName);

  console.log(`Owner: ${owner.name} (${owner.id})`);

  const services = await listAll('/services', 'service', { ownerId: owner.id });
  const databases = await listAll('/postgres', 'postgres', { ownerId: owner.id });

  const existingMigrate = services.find((service) => service.name === migrateName);
  if (existingMigrate) {
    console.log(`Found existing migrate service ${migrateName} (${existingMigrate.id})`);
    await deleteService(existingMigrate, args.dryRun);
  }

  const db = await ensurePostgres(
    databases,
    dbName,
    owner.id,
    {
      plan: postgresPlan,
      version: postgresVersion,
    },
    args.dryRun,
  );

  if (args.dryRun && !db) {
    console.log('DRY RUN: Postgres missing; creation required before migrate.');
    return;
  }

  if (!db) {
    throw new Error('Postgres not available.');
  }

  const connInfo = await waitForPostgresConnection(db.id);
  const databaseUrl =
    connInfo.internalConnectionString ||
    connInfo.externalConnectionString ||
    process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('No DATABASE_URL available');
  }

  const migratePayload = {
    repo: repoUrl,
    branch: repoBranch,
    rootDir: '.',
    autoDeploy: 'no',
    serviceDetails: {
      runtime: 'node',
      region,
      plan: servicePlan,
      envSpecificDetails: {
        buildCommand: 'pnpm install --frozen-lockfile',
        startCommand: 'pnpm db:deploy && pnpm seed && pnpm seed:challenge-metadata',
      },
    },
  };

  const { service: migrateService } = await createMigrateService(
    owner.id,
    migrateName,
    migratePayload,
    args.dryRun,
  );

  if (args.dryRun) {
    console.log('DRY RUN: skipping migrate service env update/deploy.');
    return;
  }

  if (!migrateService) {
    throw new Error('Migrate service not available.');
  }

  console.log(`Postgres: ${db.name} (${db.id})`);

  await updateServiceEnvVars(
    migrateService,
    { DATABASE_URL: databaseUrl },
    args.dryRun,
  );

  const migrateDeployId = await triggerDeploy(migrateService, args.dryRun);
  const migrateStatus = await waitForDeploy(migrateService, migrateDeployId);
  const failureStatuses = new Set([
    'build_failed',
    'update_failed',
    'canceled',
    'pre_deploy_failed',
  ]);

  if (migrateStatus && failureStatuses.has(migrateStatus)) {
    throw new Error(`Migration deploy failed: ${migrateStatus}`);
  }

  const graceSeconds = Number(process.env.RENDER_MIGRATE_GRACE_SECONDS || '30');
  if (migrateStatus === 'live' && Number.isFinite(graceSeconds) && graceSeconds > 0) {
    console.log(`Waiting ${graceSeconds}s for migrations to finish...`);
    await new Promise((resolve) => setTimeout(resolve, graceSeconds * 1000));
  }

  await new Promise((resolve) => setTimeout(resolve, 10000));

  if (!args.keepService) {
    await deleteService(migrateService, args.dryRun);
  }

  const workerService = services.find((service) => service.name === workerName);
  if (!workerService) {
    throw new Error(`Worker service not found: ${workerName}`);
  }

  const workerDeployId = await triggerDeploy(workerService, args.dryRun);
  if (workerDeployId) {
    await waitForDeploy(workerService, workerDeployId);
  }

  console.log('Migration run complete; worker redeployed.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
