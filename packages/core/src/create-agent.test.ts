import { describe, expect, it } from 'vitest';
import { createAgent } from './create-agent.js';
import type { RunEvent } from './types.js';

describe('createAgent', () => {
  const makeAgent = () =>
    createAgent({
      name: 'test-agent',
      description: 'A test agent',
      version: '1.0.0',
      tags: ['test'],
      path: '/tmp/test-agent',
      async *run(input) {
        yield {
          type: 'output',
          data: { type: 'output', content: `Hello: ${input.task}`, format: 'text' },
          timestamp: Date.now(),
        };
        yield {
          type: 'result',
          data: { type: 'result', success: true, output: 'done' },
          timestamp: Date.now(),
        };
      },
    });

  it('creates agent with correct manifest fields', () => {
    const agent = makeAgent();
    expect(agent.manifest.name).toBe('test-agent');
    expect(agent.manifest.description).toBe('A test agent');
    expect(agent.manifest.version).toBe('1.0.0');
    expect(agent.manifest.tags).toEqual(['test']);
    expect(agent.manifest.path).toBe('/tmp/test-agent');
  });

  it('run() returns AgentProcess with runId', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    expect(process.runId).toBeDefined();
    expect(typeof process.runId).toBe('string');
    expect(process.runId.length).toBeGreaterThan(0);
  });

  it('run() returns AgentProcess with events async iterable', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    expect(process.events).toBeDefined();
    expect(Symbol.asyncIterator in Object(process.events)).toBe(true);
  });

  it('events have correct shape', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }
    for (const event of events) {
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('data');
      expect(event).toHaveProperty('timestamp');
    }
  });

  it('yields output events with content and format', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'world' });
    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }
    const outputEvent = events.find((e) => e.type === 'output');
    expect(outputEvent).toBeDefined();
    expect(outputEvent!.data).toEqual({
      type: 'output',
      content: 'Hello: world',
      format: 'text',
    });
  });

  it('yields result event at end', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('result');
    expect(lastEvent.data).toEqual({ type: 'result', success: true, output: 'done' });
  });

  it('cancel() is callable', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    expect(() => process.cancel()).not.toThrow();
  });

  it('sendInput() is callable', async () => {
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    expect(() => process.sendInput('test')).not.toThrow();
  });

  it('runId is unique per call', async () => {
    const agent = makeAgent();
    const p1 = await agent.run({ task: 'a' });
    const p2 = await agent.run({ task: 'b' });
    expect(p1.runId).not.toBe(p2.runId);
  });

  it('timestamps are valid Unix ms', async () => {
    const before = Date.now();
    const agent = makeAgent();
    const process = await agent.run({ task: 'hello' });
    const events: RunEvent[] = [];
    for await (const event of process.events) {
      events.push(event);
    }
    const after = Date.now();
    for (const event of events) {
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    }
  });
});
