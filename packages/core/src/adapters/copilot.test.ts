import { describe, expect, it } from 'vitest';
import { copilot } from './copilot.js';
import type { RunEvent } from '../types.js';

const collect = async (gen: AsyncGenerator<RunEvent>): Promise<RunEvent[]> => {
  const events: RunEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
};

describe('copilot adapter', () => {
  it('yields error when SDK is not installed', async () => {
    const events = await collect(copilot('test'));
    expect(events).toHaveLength(2);
    expect(events[0]!.type).toBe('error');
    expect((events[0]!.data as Record<string, unknown>).code).toBe('MISSING_SDK');
    expect(events[1]!.type).toBe('result');
    expect((events[1]!.data as Record<string, unknown>).success).toBe(false);
  });
});
