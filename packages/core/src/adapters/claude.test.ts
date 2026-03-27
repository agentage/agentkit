import { describe, expect, it } from 'vitest';
import { claude } from './claude.js';
import type { RunEvent } from '../types.js';

const collect = async (gen: AsyncGenerator<RunEvent>): Promise<RunEvent[]> => {
  const events: RunEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
};

describe('claude adapter', () => {
  it('yields error when ANTHROPIC_API_KEY is missing', async () => {
    const original = process.env['ANTHROPIC_API_KEY'];
    delete process.env['ANTHROPIC_API_KEY'];
    try {
      const events = await collect(claude('test'));
      expect(events).toHaveLength(2);
      expect(events[0]!.type).toBe('error');
      expect((events[0]!.data as Record<string, unknown>).code).toBe('MISSING_API_KEY');
      expect(events[1]!.type).toBe('result');
      expect((events[1]!.data as Record<string, unknown>).success).toBe(false);
    } finally {
      if (original !== undefined) process.env['ANTHROPIC_API_KEY'] = original;
    }
  });

  it('yields error when SDK is not installed', async () => {
    const original = process.env['ANTHROPIC_API_KEY'];
    process.env['ANTHROPIC_API_KEY'] = 'test-key';
    try {
      const events = await collect(claude('test'));
      expect(events).toHaveLength(2);
      expect(events[0]!.type).toBe('error');
      expect((events[0]!.data as Record<string, unknown>).code).toBe('MISSING_SDK');
      expect(events[1]!.type).toBe('result');
      expect((events[1]!.data as Record<string, unknown>).success).toBe(false);
    } finally {
      if (original !== undefined) {
        process.env['ANTHROPIC_API_KEY'] = original;
      } else {
        delete process.env['ANTHROPIC_API_KEY'];
      }
    }
  });
});
