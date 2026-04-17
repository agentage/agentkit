import { describe, expect, it } from 'vitest';
import { action } from './action.js';

describe('action', () => {
  it('returns definition as-is with type inference', () => {
    const def = action<{ name: string }, { id: string }, { step: number }>({
      manifest: {
        name: 'test:echo',
        version: '1.0',
        title: 'Echo',
        description: 'Echoes name',
        scope: 'machine',
        capability: 'test.read',
        idempotent: true,
      },
      async *execute(_ctx, input) {
        yield { step: 1 };
        return { id: input.name };
      },
    });

    expect(def.manifest.name).toBe('test:echo');
    expect(typeof def.execute).toBe('function');
  });
});
