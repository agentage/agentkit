import { describe, it, expect } from 'vitest';
import { map, parallel, sequence } from './index.js';
import { collectEvents, makeFakeAgent, mockRegistry } from '../testing/index.js';
import { output as outputEvent } from '../events.js';

describe('sequence', () => {
  it('returns success with undefined output for empty', async () => {
    const s = sequence();
    const { result } = await collectEvents(s);
    expect(result).toEqual({ success: true, output: undefined });
  });

  it('runs steps in order, threads object output as config', async () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const stepA = makeFakeAgent({
      name: 'a',
      output: { fromA: 1 },
    });
    const stepB = makeFakeAgent({
      name: 'b',
      output: { fromB: 2 },
    });
    // Wrap b to record its input.config
    const bWithCapture = {
      ...stepB,
      run: async (
        input: Parameters<typeof stepB.run>[0],
        runtime: Parameters<typeof stepB.run>[1]
      ) => {
        seen.push(input.config);
        return stepB.run(input, runtime);
      },
    };
    const s = sequence(stepA, bWithCapture);
    const { result } = await collectEvents(s);
    expect(result?.success).toBe(true);
    expect(result?.output).toEqual({ fromB: 2 });
    expect(seen[0]).toEqual({ fromA: 1 });
  });

  it('halts on first failing step; returns its output', async () => {
    const stepA = makeFakeAgent({ name: 'a', fail: 'boom' });
    let bCalled = false;
    const stepB = {
      ...makeFakeAgent({ name: 'b' }),
      run: async (input: RunInput, runtime: Parameters<Agent['run']>[1]) => {
        bCalled = true;
        return makeFakeAgent({ name: 'b' }).run(input, runtime);
      },
    } as unknown as ReturnType<typeof makeFakeAgent>;
    const s = sequence(stepA, stepB);
    const { result } = await collectEvents(s);
    expect(result?.success).toBe(false);
    expect(bCalled).toBe(false);
  });

  it('resolves steps by string ref via registry', async () => {
    const stepA = makeFakeAgent({ name: 'a', output: { x: 1 } });
    const stepB = makeFakeAgent({ name: 'b', output: { y: 2 } });
    const registry = mockRegistry({ a: stepA, b: stepB });

    const s = sequence('a', 'b');
    const { result } = await collectEvents(s, { task: '' }, { registry });
    expect(result?.success).toBe(true);
    expect(result?.output).toEqual({ y: 2 });
  });

  it('forwards events from all steps', async () => {
    const stepA = makeFakeAgent({ name: 'a', events: [outputEvent('a-evt')] });
    const stepB = makeFakeAgent({ name: 'b', events: [outputEvent('b-evt')] });
    const s = sequence(stepA, stepB);
    const { events } = await collectEvents(s);
    const texts = events
      .filter((e) => e.data.type === 'output')
      .map((e) => (e.data as { content: unknown }).content);
    expect(texts).toContain('a-evt');
    expect(texts).toContain('b-evt');
  });
});

describe('parallel', () => {
  it('returns [] for empty steps', async () => {
    const p = parallel([]);
    const { result } = await collectEvents(p);
    expect(result).toEqual({ success: true, output: [] });
  });

  it('runs all steps; returns outputs in input order', async () => {
    const p = parallel([
      makeFakeAgent({ name: 'a', output: 'A' }),
      makeFakeAgent({ name: 'b', output: 'B' }),
      makeFakeAgent({ name: 'c', output: 'C' }),
    ]);
    const { result } = await collectEvents(p);
    expect(result?.success).toBe(true);
    expect(result?.output).toEqual(['A', 'B', 'C']);
  });

  it('flips success to false when any child fails, still collects all', async () => {
    const p = parallel([
      makeFakeAgent({ name: 'a', output: 'A' }),
      makeFakeAgent({ name: 'b', fail: 'b-err' }),
      makeFakeAgent({ name: 'c', output: 'C' }),
    ]);
    const { result } = await collectEvents(p);
    expect(result?.success).toBe(false);
    expect((result?.output as unknown[]).length).toBe(3);
  });

  it('interleaves events from concurrent children', async () => {
    const p = parallel([
      makeFakeAgent({ name: 'a', events: [outputEvent('a-evt')] }),
      makeFakeAgent({ name: 'b', events: [outputEvent('b-evt')] }),
    ]);
    const { events } = await collectEvents(p);
    const texts = events
      .filter((e) => e.data.type === 'output')
      .map((e) => (e.data as { content: unknown }).content);
    expect(texts).toContain('a-evt');
    expect(texts).toContain('b-evt');
  });
});

describe('map', () => {
  it('returns [] for empty items', async () => {
    const m = map<number>([], () => makeFakeAgent({ name: 'x' }));
    const { result } = await collectEvents(m);
    expect(result).toEqual({ success: true, output: [] });
  });

  it('runs factory per item and collects outputs in order', async () => {
    const items = [10, 20, 30];
    const m = map(items, (item) => makeFakeAgent({ name: `x${item}`, output: item * 2 }));
    const { result } = await collectEvents(m);
    expect(result?.success).toBe(true);
    expect(result?.output).toEqual([20, 40, 60]);
  });

  it('passes { item } as config.item to each child', async () => {
    const seen: unknown[] = [];
    const m = map([1, 2], (item) => {
      const a = makeFakeAgent({ name: `x${item}`, output: item });
      return {
        ...a,
        run: async (input: Parameters<typeof a.run>[0], runtime: Parameters<typeof a.run>[1]) => {
          seen.push((input.config as { item: unknown } | undefined)?.item);
          return a.run(input, runtime);
        },
      };
    });
    await collectEvents(m);
    expect(seen.sort()).toEqual([1, 2]);
  });

  it('flips success to false when any child fails', async () => {
    const m = map([1, 2], (i) =>
      i === 2 ? makeFakeAgent({ name: 'x', fail: 'bad' }) : makeFakeAgent({ name: 'x', output: i })
    );
    const { result } = await collectEvents(m);
    expect(result?.success).toBe(false);
    expect((result?.output as unknown[]).length).toBe(2);
  });
});

// Import types referenced above (pulled up here so the file reads top-to-bottom)
import type { Agent, RunInput } from '../types.js';
void ({} as Agent);
void ({} as RunInput);
