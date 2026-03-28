import { describe, expect, it } from 'vitest';
import { agent } from './agent.js';
import { output, result } from './events.js';
import type { RunEvent } from './types.js';

const collect = async (events: AsyncIterable<RunEvent>): Promise<RunEvent[]> => {
  const result: RunEvent[] = [];
  for await (const event of events) {
    result.push(event);
  }
  return result;
};

describe('agent', () => {
  it('creates agent with manifest fields', () => {
    const a = agent({
      name: 'test',
      description: 'A test agent',
      version: '1.0.0',
      tags: ['test'],
    });
    expect(a.manifest.name).toBe('test');
    expect(a.manifest.description).toBe('A test agent');
    expect(a.manifest.version).toBe('1.0.0');
    expect(a.manifest.tags).toEqual(['test']);
    expect(a.manifest.path).toBe('');
  });

  it('defaults name to empty string', () => {
    const a = agent({ description: 'no name' });
    expect(a.manifest.name).toBe('');
  });

  it('stores declarative config in manifest.config', () => {
    const a = agent({
      model: 'claude-sonnet-4-6',
      prompt: 'You are a reviewer',
      tools: ['read', 'grep'],
      temperature: 0.7,
      maxTurns: 10,
    });
    expect(a.manifest.config).toEqual({
      model: 'claude-sonnet-4-6',
      prompt: 'You are a reviewer',
      tools: ['read', 'grep'],
      temperature: 0.7,
      maxTurns: 10,
    });
  });

  it('omits config when no declarative fields', () => {
    const a = agent({ description: 'simple' });
    expect(a.manifest.config).toBeUndefined();
  });

  it('run() returns AgentProcess with unique runId', async () => {
    const a = agent({ async *run() {} });
    const p1 = await a.run({ task: 'a' });
    const p2 = await a.run({ task: 'b' });
    expect(typeof p1.runId).toBe('string');
    expect(p1.runId).not.toBe(p2.runId);
  });

  it('yields events from run function', async () => {
    const a = agent({
      async *run({ task }) {
        yield output(`Hello: ${task}`);
        yield result(true, 'done');
      },
    });
    const process = await a.run({ task: 'world' });
    const events = await collect(process.events);

    expect(events).toHaveLength(2);
    expect(events[0]!.data).toEqual({ type: 'output', content: 'Hello: world', format: 'text' });
    expect(events[1]!.data).toEqual({ type: 'result', success: true, output: 'done' });
  });

  it('auto-emits result(true) when run completes without result', async () => {
    const a = agent({
      async *run() {
        yield output('working...');
      },
    });
    const process = await a.run({ task: 'test' });
    const events = await collect(process.events);

    expect(events).toHaveLength(2);
    expect(events[1]!.type).toBe('result');
    expect(events[1]!.data).toEqual({ type: 'result', success: true, output: undefined });
  });

  it('auto-emits result(false) when run throws', async () => {
    const a = agent({
      async *run() {
        yield output('starting...');
        throw new Error('boom');
      },
    });
    const process = await a.run({ task: 'test' });
    const events = await collect(process.events);

    expect(events).toHaveLength(2);
    expect(events[1]!.type).toBe('result');
    expect(events[1]!.data).toEqual({ type: 'result', success: false, output: 'boom' });
  });

  it('does not double-emit result if run already yielded one', async () => {
    const a = agent({
      async *run() {
        yield result(true, 'explicit');
      },
    });
    const process = await a.run({ task: 'test' });
    const events = await collect(process.events);

    const results = events.filter((e) => e.type === 'result');
    expect(results).toHaveLength(1);
    expect(results[0]!.data).toEqual({ type: 'result', success: true, output: 'explicit' });
  });

  it('declarative agent (no run) calls claude adapter', async () => {
    const a = agent({
      model: 'claude-sonnet-4-6',
      prompt: 'You are a reviewer',
    });
    const process = await a.run({ task: 'review this' });
    const events = await collect(process.events);

    // Without the Claude SDK installed, the adapter yields an error + result(false)
    const errors = events.filter((e) => e.type === 'error');
    const results = events.filter((e) => e.type === 'result');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(results).toHaveLength(1);
    expect((results[0]!.data as { success: boolean }).success).toBe(false);
  });

  it('cancel() aborts the signal', async () => {
    let receivedSignal: AbortSignal | undefined;
    const a = agent({
      async *run(_input, { signal }) {
        receivedSignal = signal;
        yield output('waiting');
      },
    });

    const process = await a.run({ task: 'test' });
    const iterator = process.events[Symbol.asyncIterator]();
    await iterator.next();

    expect(receivedSignal!.aborted).toBe(false);
    process.cancel();
    expect(receivedSignal!.aborted).toBe(true);
  });

  it('cancel() stops event iteration', async () => {
    const a = agent({
      async *run(_input, { sleep }) {
        for (let i = 0; i < 100; i++) {
          yield output(`${i}`);
          await sleep(10);
        }
      },
    });

    const process = await a.run({ task: 'test' });
    const events: RunEvent[] = [];
    let count = 0;
    for await (const event of process.events) {
      events.push(event);
      count++;
      if (count >= 3) process.cancel();
    }

    expect(events.length).toBeLessThan(100);
  });

  it('sleep() resolves after delay', async () => {
    let sleptMs = 0;
    const a = agent({
      async *run(_input, { sleep }) {
        const before = Date.now();
        await sleep(50);
        sleptMs = Date.now() - before;
        yield output('done');
      },
    });

    const process = await a.run({ task: 'test' });
    await collect(process.events);
    expect(sleptMs).toBeGreaterThanOrEqual(40);
  });

  it('sleep() resolves early on abort without throwing', async () => {
    const a = agent({
      async *run(_input, { signal, sleep }) {
        await sleep(60_000);
        if (!signal.aborted) {
          yield output('should not reach');
        }
      },
    });

    const process = await a.run({ task: 'test' });
    const iterator = process.events[Symbol.asyncIterator]();

    // Cancel immediately — sleep should resolve early
    setTimeout(() => process.cancel(), 10);
    const { done } = await iterator.next();
    // Generator completes without yielding output (signal was aborted)
    expect(done).toBe(true);
  });

  it('cancel() and sendInput() are callable without error', async () => {
    const a = agent({ async *run() {} });
    const process = await a.run({ task: 'test' });
    expect(() => process.cancel()).not.toThrow();
    expect(() => process.cancel()).not.toThrow();
    expect(() => process.sendInput('hello')).not.toThrow();
  });

  it('timestamps are valid Unix ms', async () => {
    const before = Date.now();
    const a = agent({
      async *run() {
        yield output('hi');
      },
    });
    const process = await a.run({ task: 'test' });
    const events = await collect(process.events);
    const after = Date.now();

    for (const event of events) {
      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    }
  });
});
