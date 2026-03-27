import { spawn, type ChildProcess } from 'node:child_process';
import { createInterface, type Interface } from 'node:readline';
import type { RunEvent } from '../types.js';
import { output, error as errorEvent, result } from '../events.js';

/** Run a shell command and stream output as events */
export async function* shell(
  command: string,
  options?: { signal?: AbortSignal }
): AsyncGenerator<RunEvent> {
  if (!command.trim()) {
    yield errorEvent('EMPTY_COMMAND', 'No command provided');
    yield result(false, 'No command provided');
    return;
  }

  const signal = options?.signal;
  if (signal?.aborted) return;

  const events: RunEvent[] = [];
  let exitCode: number | null = null;

  await new Promise<void>((resolve) => {
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
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    if (proc.stdout) {
      const rl = createInterface({ input: proc.stdout });
      readers.push(rl);
      rl.on('line', (line) => {
        events.push(output(line));
      });
    }

    if (proc.stderr) {
      const rl = createInterface({ input: proc.stderr });
      readers.push(rl);
      rl.on('line', (line) => {
        events.push(errorEvent('STDERR', line, true));
      });
    }

    proc.on('error', (err) => {
      events.push(errorEvent('SPAWN_ERROR', err.message));
      cleanup();
      resolve();
    });

    proc.on('close', (code) => {
      exitCode = code;
      signal?.removeEventListener('abort', onAbort);
      cleanup();
      resolve();
    });
  });

  for (const event of events) {
    yield event;
  }

  if (!signal?.aborted) {
    yield result(
      exitCode === 0,
      exitCode === 0 ? 'Command completed' : `Exited with code ${exitCode}`
    );
  }
}
