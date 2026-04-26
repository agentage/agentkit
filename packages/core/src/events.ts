import type { ContentPart, ResultOutput, RunEvent } from './types.js';

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

/**
 * Create a result event.
 *
 * `output` may be:
 *   - A single value (legacy / programmatic shape).
 *   - An array of `ContentPart` for multi-format results — order signals
 *     preference. Build via `parts({ markdown, json, text })` or pass the
 *     array literally.
 *
 * @example
 *   yield result(true, parts({
 *     markdown: '# Done\n\n42 commits',
 *     json: { commits: 42 },
 *   }));
 */
export const result = (success: boolean, output?: ResultOutput): RunEvent => ({
  type: 'result',
  data: { type: 'result', success, output },
  timestamp: Date.now(),
});

/**
 * Build a `ContentPart[]` for `result()`. Order signals render preference:
 * markdown → text → json. Pass through `extra` for non-canonical MIME parts.
 */
export const parts = (input: {
  markdown?: string;
  text?: string;
  json?: unknown;
  extra?: ContentPart[];
}): ContentPart[] => {
  const list: ContentPart[] = [];
  if (input.markdown != null) list.push({ type: 'text/markdown', content: input.markdown });
  if (input.text != null) list.push({ type: 'text/plain', content: input.text });
  if (input.json !== undefined) list.push({ type: 'application/json', content: input.json });
  if (input.extra) list.push(...input.extra);
  return list;
};
