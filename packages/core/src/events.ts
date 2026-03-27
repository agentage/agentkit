import type { RunEvent } from './types.js';

/** Create a text output event */
export const output = (content: unknown, format = 'text'): RunEvent => ({
  type: 'output',
  data: { type: 'output', content, format },
  timestamp: Date.now(),
});

/** Create a progress output event */
export const progress = (percent: number, message?: string): RunEvent => ({
  type: 'output',
  data: { type: 'output', content: { percent, message }, format: 'progress' },
  timestamp: Date.now(),
});

/** Create an error event */
export const error = (code: string, message: string, recoverable = false): RunEvent => ({
  type: 'error',
  data: { type: 'error', code, message, recoverable },
  timestamp: Date.now(),
});

/** Create a result event */
export const result = (success: boolean, output?: unknown): RunEvent => ({
  type: 'result',
  data: { type: 'result', success, output },
  timestamp: Date.now(),
});
