import { describe, expect, it } from 'vitest';
import { createAgent } from './create-agent.js';
import type { RunEvent } from './types.js';

describe('createAgent end-to-end', () => {
  it('creates agent, runs it, collects events', async () => {
    const agent = createAgent({
      name: 'echo-agent',
      description: 'Echoes input',
      path: '/tmp/echo',
      async *run(input) {
        yield {
          type: 'output',
          data: { type: 'output', content: `Echo: ${input.task}`, format: 'text' },
          timestamp: Date.now(),
        };
        yield {
          type: 'result',
          data: { type: 'result', success: true, output: 'done' },
          timestamp: Date.now(),
        };
      },
    });

    const process = await agent.run({ task: 'hello' });
    expect(typeof process.runId).toBe('string');

    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }

    expect(events.length).toBeGreaterThanOrEqual(2);

    const outputEvents = events.filter((e) => e.type === 'output');
    expect(outputEvents.length).toBeGreaterThanOrEqual(1);
    const outputData = outputEvents[0].data;
    expect(outputData.type).toBe('output');
    if (outputData.type === 'output') {
      expect(outputData.format).toBe('text');
    }

    const resultEvents = events.filter((e) => e.type === 'result');
    expect(resultEvents).toHaveLength(1);
    const resultEvent = resultEvents[0];
    expect(resultEvent.data).toEqual({ type: 'result', success: true, output: 'done' });
    expect(resultEvent).toBe(events[events.length - 1]);

    for (const event of events) {
      expect(event.timestamp).toBeGreaterThan(0);
      expect(typeof event.timestamp).toBe('number');
    }
  });
});
