import { describe, expect, it } from 'vitest';
import { OUTPUT_FORMATS, STATE_TRANSITIONS, TERMINAL_STATES } from './constants.js';

describe('TERMINAL_STATES', () => {
  it('contains exactly completed, failed, canceled', () => {
    expect(TERMINAL_STATES).toEqual(['completed', 'failed', 'canceled']);
  });
});

describe('STATE_TRANSITIONS', () => {
  it('has entries for all 6 states', () => {
    expect(Object.keys(STATE_TRANSITIONS)).toHaveLength(6);
  });

  it('terminal states have empty arrays', () => {
    expect(STATE_TRANSITIONS.completed).toEqual([]);
    expect(STATE_TRANSITIONS.failed).toEqual([]);
    expect(STATE_TRANSITIONS.canceled).toEqual([]);
  });
});

describe('OUTPUT_FORMATS', () => {
  it('has expected keys', () => {
    expect(OUTPUT_FORMATS.text).toBe('text');
    expect(OUTPUT_FORMATS.markdown).toBe('markdown');
    expect(OUTPUT_FORMATS.json).toBe('json');
    expect(OUTPUT_FORMATS.binary).toBe('binary');
    expect(OUTPUT_FORMATS.llmDelta).toBe('llm.delta');
    expect(OUTPUT_FORMATS.llmMessage).toBe('llm.message');
    expect(OUTPUT_FORMATS.llmUsage).toBe('llm.usage');
    expect(OUTPUT_FORMATS.llmToolCall).toBe('llm.tool_call');
    expect(OUTPUT_FORMATS.llmToolResult).toBe('llm.tool_result');
    expect(OUTPUT_FORMATS.llmThinking).toBe('llm.thinking');
    expect(OUTPUT_FORMATS.progress).toBe('progress');
  });
});
