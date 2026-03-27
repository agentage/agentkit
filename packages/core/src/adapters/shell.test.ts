import { describe, expect, it } from 'vitest';
import { shell } from './shell.js';
import type { RunEvent } from '../types.js';

const collect = async (gen: AsyncGenerator<RunEvent>): Promise<RunEvent[]> => {
  const events: RunEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
};

describe('shell adapter', () => {
  it('captures stdout as output events', async () => {
    const events = await collect(shell('echo hello'));
    const outputs = events.filter(
      (e) => e.type === 'output' && (e.data as Record<string, unknown>).format === 'text'
    );
    expect(outputs.length).toBeGreaterThanOrEqual(1);
    expect((outputs[0]!.data as Record<string, unknown>).content).toBe('hello');
  });

  it('yields result(true) on exit 0', async () => {
    const events = await collect(shell('true'));
    const last = events[events.length - 1]!;
    expect(last.type).toBe('result');
    expect((last.data as Record<string, unknown>).success).toBe(true);
  });

  it('yields result(false) on non-zero exit', async () => {
    const events = await collect(shell('false'));
    const last = events[events.length - 1]!;
    expect(last.type).toBe('result');
    expect((last.data as Record<string, unknown>).success).toBe(false);
  });

  it('captures stderr as error events', async () => {
    const events = await collect(shell('echo fail >&2'));
    const errors = events.filter((e) => e.type === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect((errors[0]!.data as Record<string, unknown>).message).toBe('fail');
  });

  it('yields error on empty command', async () => {
    const events = await collect(shell(''));
    expect(events[0]!.type).toBe('error');
    expect((events[0]!.data as Record<string, unknown>).code).toBe('EMPTY_COMMAND');
  });

  it('respects abort signal', async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100);
    const events = await collect(shell('sleep 60', { signal: controller.signal }));
    // Should finish quickly, not wait 60s
    expect(events.length).toBeLessThanOrEqual(2);
  }, 10_000);

  it('returns immediately if already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const events = await collect(shell('echo should-not-run', { signal: controller.signal }));
    expect(events).toHaveLength(0);
  });
});
