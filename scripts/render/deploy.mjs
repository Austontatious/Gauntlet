#!/usr/bin/env node

const API_BASE = 'https://api.render.com/v1';

function parseArgs(argv) {
  const out = {
    dryRun: false,
    workerEnabled: undefined,
    runUntrusted: undefined,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }

    if (arg.startsWith('--worker-enabled=')) {
      out.workerEnabled = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--run-untrusted=')) {
      out.runUntrusted = arg.split('=')[1];
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
  console.log(
    'Usage: node scripts/render/deploy.mjs [--dry-run] [--worker-enabled=true|false] [--run-untrusted=true|false]',
  );
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

function normalizeBool(value, defaultValue) {
  if (value === undefined || value === null) return defaultValue;
  if (value === 'true' || value === true) return 'true';
  if (value === 'false' || value === false) return 'false';
  throw new Error(`Invalid boolean value: ${value}`);
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
  if (!service) return;
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
  if (!service) return null;
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

async function waitForDeploy(service, deployId) {
  if (!service || !deployId) return null;

  const terminal = new Set([
    'live',
    'deactivated',
    'build_failed',
    'update_failed',
    'canceled',
    'pre_deploy_failed',
  ]);

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

async function ensureService(
  services,
  name,
  ownerId,
  type,
  payload,
  dryRun,
) {
  const existing = services.find((service) => service.name === name);
  if (existing) return existing;

  if (dryRun) {
    console.log(`DRY RUN: ${name} not found; would create ${type} service`);
    return null;
  }

  const created = await fetchJson('/services', {
    method: 'POST',
    body: JSON.stringify({
      type,
      name,
      ownerId,
      ...payload,
    }),
  });

  const service = created?.service ?? created;
  if (!service?.id) {
    throw new Error(`Create service response missing id for ${name}`);
  }
  if (created?.deployId) {
    console.log(`Create deploy queued for ${name}: ${created.deployId}`);
  }
  console.log(`Created service ${name} (${service.id})`);
  return service;
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const ownerIdEnv = process.env.RENDER_OWNER_ID;
  const ownerName = process.env.RENDER_OWNER_NAME;
  const webName = process.env.RENDER_WEB_SERVICE_NAME || 'gauntlet-web';
  const workerName = process.env.RENDER_WORKER_SERVICE_NAME || 'gauntlet-worker';
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

  const webPayload = {
    repo: repoUrl,
    branch: repoBranch,
    rootDir: '.',
    autoDeploy: 'yes',
    serviceDetails: {
      runtime: 'node',
      region,
      plan: servicePlan,
      envSpecificDetails: {
        buildCommand: 'pnpm install --frozen-lockfile && pnpm build:web',
        startCommand: 'pnpm start:web',
      },
    },
  };

  const workerPayload = {
    repo: repoUrl,
    branch: repoBranch,
    rootDir: '.',
    autoDeploy: 'yes',
    serviceDetails: {
      runtime: 'node',
      region,
      plan: servicePlan,
      envSpecificDetails: {
        buildCommand: 'pnpm install --frozen-lockfile && pnpm build:worker',
        startCommand: 'pnpm start:worker',
      },
    },
  };

  const webService = await ensureService(
    services,
    webName,
    owner.id,
    'web_service',
    webPayload,
    args.dryRun,
  );

  const workerService = await ensureService(
    services,
    workerName,
    owner.id,
    'background_worker',
    workerPayload,
    args.dryRun,
  );

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

  if (args.dryRun && (!webService || !workerService || !db)) {
    console.log('DRY RUN: resources missing; creation required before deploy.');
    return;
  }

  if (!webService || !workerService || !db) {
    throw new Error('Missing required resources after create step.');
  }

  const connInfo = await waitForPostgresConnection(db.id);
  const databaseUrl =
    connInfo.internalConnectionString ||
    connInfo.externalConnectionString ||
    process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('No DATABASE_URL available');
  }

  const workerEnabled = normalizeBool(
    args.workerEnabled ?? process.env.WORKER_ENABLED,
    'false',
  );
  const runUntrusted = normalizeBool(
    args.runUntrusted ?? process.env.RUN_UNTRUSTED_CODE,
    'false',
  );

  const webEnv = {
    DATABASE_URL: databaseUrl,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  };

  const workerEnv = {
    DATABASE_URL: databaseUrl,
    WORKER_ENABLED: workerEnabled,
    RUN_UNTRUSTED_CODE: runUntrusted,
  };

  console.log(`Web service: ${webService.name} (${webService.id})`);
  console.log(`Worker service: ${workerService.name} (${workerService.id})`);
  console.log(`Postgres: ${db.name} (${db.id})`);

  if (webService.serviceDetails?.url) {
    console.log(`Web URL: ${webService.serviceDetails.url}`);
  }

  await updateServiceEnvVars(webService, webEnv, args.dryRun);
  await updateServiceEnvVars(workerService, workerEnv, args.dryRun);

  const webDeployId = await triggerDeploy(webService, args.dryRun);
  const workerDeployId = await triggerDeploy(workerService, args.dryRun);

  if (!args.dryRun) {
    const webStatus = await waitForDeploy(webService, webDeployId);
    const workerStatus = await waitForDeploy(workerService, workerDeployId);

    console.log(`Deploy finished: ${webService.name}=${webStatus}`);
    console.log(`Deploy finished: ${workerService.name}=${workerStatus}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
