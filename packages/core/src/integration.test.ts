import { describe, expect, it } from 'vitest';
import { agent, output, result } from './index.js';
import type { RunEvent } from './types.js';

describe('agent end-to-end', () => {
  it('creates agent, runs it, collects events', async () => {
    const a = agent({
      name: 'echo-agent',
      description: 'Echoes input',
      async *run(input) {
        yield output(`Echo: ${input.task}`);
        yield result(true, 'done');
      },
    });

    const process = await a.run({ task: 'hello' });
    expect(typeof process.runId).toBe('string');

    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }

    expect(events.length).toBeGreaterThanOrEqual(2);

    const outputEvents = events.filter((e) => e.type === 'output');
    expect(outputEvents.length).toBeGreaterThanOrEqual(1);
    expect(outputEvents[0]!.data).toEqual({
      type: 'output',
      content: 'Echo: hello',
      format: 'text',
    });

    const resultEvents = events.filter((e) => e.type === 'result');
    expect(resultEvents).toHaveLength(1);
    expect(resultEvents[0]!.data).toEqual({ type: 'result', success: true, output: 'done' });
    expect(resultEvents[0]).toBe(events[events.length - 1]);

    for (const event of events) {
      expect(event.timestamp).toBeGreaterThan(0);
    }
  });
});
