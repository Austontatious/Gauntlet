import { spawn } from 'node:child_process';

interface RunCommandOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs: number;
  maxOutputBytes?: number;
}

interface RunCommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;
const TRUNCATION_MARKER = '\n...truncated\n';

function appendOutput(current: string, chunk: string, maxBytes: number) {
  if (!chunk) return current;
  const next = current + chunk;
  if (next.length <= maxBytes) return next;
  const available = maxBytes - TRUNCATION_MARKER.length;
  if (available <= 0) {
    return TRUNCATION_MARKER.slice(0, Math.max(maxBytes, 0));
  }
  return TRUNCATION_MARKER + next.slice(next.length - available);
}

export async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions,
): Promise<RunCommandResult> {
  const { cwd, env, timeoutMs } = options;
  const maxOutputBytes =
    typeof options.maxOutputBytes === 'number' && options.maxOutputBytes > 0
      ? options.maxOutputBytes
      : DEFAULT_MAX_OUTPUT_BYTES;
  const start = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout = appendOutput(stdout, chunk.toString(), maxOutputBytes);
    });

    child.stderr.on('data', (chunk) => {
      stderr = appendOutput(stderr, chunk.toString(), maxOutputBytes);
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      stderr = appendOutput(stderr, error.message, maxOutputBytes);
      resolve({
        code: 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut,
      });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        code,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut,
      });
    });
  });
}
