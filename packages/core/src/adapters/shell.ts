import { spawn, type ChildProcess } from 'node:child_process';
import { createInterface, type Interface } from 'node:readline';
import type { RunEvent } from '../types.js';
import { output, error as errorEvent, result } from '../events.js';

const DEFAULT_TIMEOUT_MS = 5 * 60_000; // 5 minutes

/** Run a shell command and stream output line-by-line as events */
export async function* shell(
  command: string,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): AsyncGenerator<RunEvent> {
  if (!command.trim()) {
    yield errorEvent('EMPTY_COMMAND', 'No command provided');
    yield result(false, 'No command provided');
    return;
  }

  const signal = options?.signal;
  if (signal?.aborted) return;

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Channel: push events from readline callbacks, pull from generator
  const queue: RunEvent[] = [];
  let resolve: (() => void) | null = null;
  let done = false;
  let exitCode: number | null = null;
  let timedOut = false;

  const push = (event: RunEvent): void => {
    queue.push(event);
    if (resolve) {
      resolve();
      resolve = null;
    }
  };

  const waitForEvent = (): Promise<void> =>
    new Promise<void>((r) => {
      if (queue.length > 0 || done) {
        r();
      } else {
        resolve = r;
      }
    });

  const proc: ChildProcess = spawn(command, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  const readers: Interface[] = [];

  const cleanup = (): void => {
    for (const rl of readers) rl.close();
  };

  const killGroup = (): void => {
    try {
      if (proc.pid) process.kill(-proc.pid, 'SIGKILL');
    } catch {
      proc.kill('SIGKILL');
    }
  };

  const onAbort = (): void => {
    cleanup();
    killGroup();
    done = true;
    if (resolve) {
      resolve();
      resolve = null;
    }
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  if (proc.stdout) {
    const rl = createInterface({ input: proc.stdout });
    readers.push(rl);
    rl.on('line', (line) => {
      push(output(line));
    });
  }

  if (proc.stderr) {
    const rl = createInterface({ input: proc.stderr });
    readers.push(rl);
    rl.on('line', (line) => {
      push(errorEvent('STDERR', line, true));
    });
  }

  proc.on('error', (err) => {
    push(errorEvent('SPAWN_ERROR', err.message));
    done = true;
    cleanup();
  });

  proc.on('close', (code) => {
    exitCode = code;
    done = true;
    signal?.removeEventListener('abort', onAbort);
    cleanup();
    if (resolve) {
      resolve();
      resolve = null;
    }
  });

  // Timeout: kill process after timeoutMs
  const timer = setTimeout(() => {
    if (!done) {
      timedOut = true;
      push(errorEvent('TIMEOUT', `Command timed out after ${timeoutMs}ms`, false));
      cleanup();
      killGroup();
    }
  }, timeoutMs);

  // Yield events as they arrive — true streaming
  while (!done || queue.length > 0) {
    if (queue.length === 0 && !done) {
      await waitForEvent();
    }
    while (queue.length > 0) {
      yield queue.shift()!;
    }
  }

  clearTimeout(timer);

  if (!signal?.aborted) {
    if (timedOut) {
      yield result(false, `Command timed out after ${timeoutMs}ms`);
    } else {
      yield result(
        exitCode === 0,
        exitCode === 0 ? 'Command completed' : `Exited with code ${exitCode}`
      );
    }
  }
}
