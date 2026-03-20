import type { RunState } from './types.js';

/** Terminal states — no further transitions */
export const TERMINAL_STATES: readonly RunState[] = ['completed', 'failed', 'canceled'] as const;

/** Valid state transitions */
export const STATE_TRANSITIONS: Readonly<Record<RunState, readonly RunState[]>> = {
  submitted: ['working', 'canceled'],
  working: ['completed', 'failed', 'canceled', 'input_required'],
  input_required: ['working', 'canceled'],
  completed: [],
  failed: [],
  canceled: [],
} as const;

/** Output format string constants */
export const OUTPUT_FORMATS = {
  text: 'text',
  markdown: 'markdown',
  json: 'json',
  binary: 'binary',
  llmDelta: 'llm.delta',
  llmMessage: 'llm.message',
  llmUsage: 'llm.usage',
  llmToolCall: 'llm.tool_call',
  llmToolResult: 'llm.tool_result',
  llmThinking: 'llm.thinking',
  progress: 'progress',
} as const;
