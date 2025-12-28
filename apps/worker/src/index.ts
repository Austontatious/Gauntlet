import 'dotenv/config';
import { startWorker } from './worker';

const intervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 3000);

startWorker({ intervalMs }).catch((error) => {
  console.error('Worker failed to start', error);
  process.exit(1);
});
