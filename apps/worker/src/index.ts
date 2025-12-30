import 'dotenv/config';
import { startWorker } from './worker.js';

const workerEnabled = process.env.WORKER_ENABLED === 'true';
if (!workerEnabled) {
  console.log('WORKER_DISABLED: set WORKER_ENABLED=true to run scorer');
  process.exit(0);
}

const runUntrusted = process.env.RUN_UNTRUSTED_CODE === 'true';
if (!runUntrusted) {
  console.log('UNTRUSTED_EXECUTION_DISABLED: set RUN_UNTRUSTED_CODE=true to run scorer');
  process.exit(0);
}

const intervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 3000);
const maxConcurrency = Number(process.env.WORKER_MAX_CONCURRENCY ?? 1);
const maxRuntimeMs = Number(process.env.MAX_JOB_RUNTIME_MS ?? 5000);
const watchdogIntervalMs = Number(process.env.WORKER_WATCHDOG_INTERVAL_MS ?? 2000);

startWorker({ intervalMs, maxConcurrency, maxRuntimeMs, watchdogIntervalMs }).catch(
  (error: unknown) => {
    console.error('Worker failed to start', error);
    process.exit(1);
  },
);
