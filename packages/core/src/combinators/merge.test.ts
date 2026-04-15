import { describe, it, expect } from 'vitest';
import { mergeGenerators } from './merge.js';

async function* sourceA(): AsyncGenerator<string, number, void> {
  yield 'a1';
  yield 'a2';
  return 1;
}
async function* sourceB(): AsyncGenerator<string, number, void> {
  yield 'b1';
  return 2;
}

const waitFor = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function* slowSource(
  label: string,
  count: number,
  delay: number
): AsyncGenerator<string, number, void> {
  for (let i = 0; i < count; i++) {
    await waitFor(delay);
    yield `${label}${i}`;
  }
  return count;
}

describe('mergeGenerators', () => {
  it('yields values from all generators and collects returns in input order', async () => {
    const merged = mergeGenerators([sourceA(), sourceB()]);
    const seen: string[] = [];
    let done: number[] | undefined;
    while (true) {
      const next = await merged.next();
      if (next.done) {
        done = next.value;
        break;
      }
      seen.push(next.value);
    }
    expect(seen.sort()).toEqual(['a1', 'a2', 'b1']);
    expect(done).toEqual([1, 2]);
  });

  it('empty input -> empty returns, no yields', async () => {
    const merged = mergeGenerators<string, number>([]);
    const next = await merged.next();
    expect(next.done).toBe(true);
    if (next.done) expect(next.value).toEqual([]);
  });

  it('interleaves fast and slow generators (arrival order)', async () => {
    // fast yields twice rapidly; slow yields after a pause
    const fast = (async function* (): AsyncGenerator<string, number, void> {
      yield 'f1';
      yield 'f2';
      return 1;
    })();
    const slow = slowSource('s', 2, 20);

    const merged = mergeGenerators<string, number>([fast, slow]);
    const seen: string[] = [];
    while (true) {
      const next = await merged.next();
      if (next.done) break;
      seen.push(next.value);
    }
    // fast yields should appear before slow yields
    expect(seen.indexOf('f1')).toBeLessThan(seen.indexOf('s0'));
    expect(seen.indexOf('f2')).toBeLessThan(seen.indexOf('s1'));
  });
});
