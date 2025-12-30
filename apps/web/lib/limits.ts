const DEFAULT_MAX_ZIP_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_UNZIPPED_BYTES = 50 * 1024 * 1024;
const DEFAULT_MAX_FILE_COUNT = 2000;
const DEFAULT_MAX_JOB_RUNTIME_MS = 5000;
const DEFAULT_WORKER_MAX_CONCURRENCY = 1;
const DEFAULT_MAX_LOG_BYTES = 64 * 1024;

function readLimit(key: string, fallback: number) {
  const raw = process.env[key];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const MAX_ZIP_BYTES = readLimit('MAX_ZIP_BYTES', DEFAULT_MAX_ZIP_BYTES);
export const MAX_UNZIPPED_BYTES = readLimit(
  'MAX_UNZIPPED_BYTES',
  DEFAULT_MAX_UNZIPPED_BYTES,
);
export const MAX_FILE_COUNT = readLimit('MAX_FILE_COUNT', DEFAULT_MAX_FILE_COUNT);
export const MAX_JOB_RUNTIME_MS = readLimit(
  'MAX_JOB_RUNTIME_MS',
  DEFAULT_MAX_JOB_RUNTIME_MS,
);
export const WORKER_MAX_CONCURRENCY = readLimit(
  'WORKER_MAX_CONCURRENCY',
  DEFAULT_WORKER_MAX_CONCURRENCY,
);
export const MAX_LOG_BYTES = readLimit('MAX_LOG_BYTES', DEFAULT_MAX_LOG_BYTES);
