import type { RunEvent } from '../../types.js';

/** Shell-like dependency: takes a command string, yields run events. Stubbable in tests. */
export type ShellExec = (
  command: string,
  options?: { signal?: AbortSignal; timeoutMs?: number; cwd?: string }
) => AsyncIterable<RunEvent>;

export interface ActionProgress {
  step: string;
  detail?: string;
}
