import { describe, it, expect } from 'vitest';
import { collectEvents, fakeOutput, makeFakeAgent, mockRegistry } from './index.js';
import { output as outputEvent } from '../events.js';

describe('makeFakeAgent', () => {
  it('yields a success result when no events are given', async () => {
    const agent = makeFakeAgent({ name: 'empty' });
    const { result, events } = await collectEvents(agent);
    expect(result).toEqual({ success: true, output: undefined });
    expect(events).toHaveLength(1);
    expect(events[0].data.type).toBe('result');
  });

  it('yields configured events before the result', async () => {
    const agent = makeFakeAgent({
      name: 'with-events',
      events: [outputEvent('a'), outputEvent('b')],
      output: { ok: true },
    });
    const { events, result } = await collectEvents(agent);
    expect(events.map((e) => e.data.type)).toEqual(['output', 'output', 'result']);
    expect(result).toEqual({ success: true, output: { ok: true } });
  });

  it('yields a failing result when fail is set', async () => {
    const agent = makeFakeAgent({ fail: 'boom' });
    const { result } = await collectEvents(agent);
    expect(result?.success).toBe(false);
  });

  it('propagates inputSchema and outputSchema onto the manifest', () => {
    const agent = makeFakeAgent({
      inputSchema: { type: 'object' },
      outputSchema: { type: 'object' },
    });
    expect(agent.manifest.inputSchema).toEqual({ type: 'object' });
    expect(agent.manifest.outputSchema).toEqual({ type: 'object' });
  });
});

describe('fakeOutput', () => {
  it('creates an output event with the given text', () => {
    const e = fakeOutput('hi');
    expect(e.data.type).toBe('output');
  });
});

describe('mockRegistry', () => {
  it('resolves a registered agent', async () => {
    const a = makeFakeAgent({ name: 'a' });
    const reg = mockRegistry({ a });
    expect(await reg.resolve('a')).toBe(a);
  });

  it('returns null for unknown refs', async () => {
    const reg = mockRegistry({});
    expect(await reg.resolve('ghost')).toBeNull();
  });

  it('supports lazy factory entries', async () => {
    const a = makeFakeAgent({ name: 'lazy' });
    let calls = 0;
    const reg = mockRegistry({
      lazy: async () => {
        calls++;
        return a;
      },
    });
    expect(await reg.resolve('lazy')).toBe(a);
    expect(calls).toBe(1);
  });
});
