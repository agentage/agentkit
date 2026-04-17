import { describe, expect, it } from 'vitest';
import { action } from './action.js';
import { createRegistry } from './registry.js';
import type { ActionDefinition, InvokeEvent, InvokeRequest } from './types.js';

const echo = action<{ msg: string }, { echoed: string }, { step: number }>({
  manifest: {
    name: 'test:echo',
    version: '1.0',
    title: 'Echo',
    description: 'Echo a message',
    scope: 'machine',
    capability: 'test.read',
    idempotent: true,
  },
  async *execute(_ctx, input) {
    yield { step: 1 };
    yield { step: 2 };
    return { echoed: input.msg };
  },
});

const boom = action<Record<string, never>, never, never>({
  manifest: {
    name: 'test:boom',
    version: '1.0',
    title: 'Boom',
    description: 'Throws',
    scope: 'machine',
    capability: 'test.write',
    idempotent: false,
  },
  async *execute() {
    yield undefined as never;
    throw new Error('kaboom');
  },
});

const collect = async (gen: AsyncGenerator<InvokeEvent>): Promise<InvokeEvent[]> => {
  const events: InvokeEvent[] = [];
  for await (const e of gen) events.push(e);
  return events;
};

const req = (overrides: Partial<InvokeRequest> = {}): InvokeRequest => ({
  action: 'test:echo',
  input: { msg: 'hi' },
  callerId: 'caller-1',
  capabilities: ['test.read'],
  ...overrides,
});

describe('createRegistry', () => {
  it('registers + lists actions', () => {
    const reg = createRegistry();
    reg.register(echo);
    expect(reg.list()).toHaveLength(1);
    expect(reg.list()[0]!.name).toBe('test:echo');
  });

  it('rejects duplicate name+version', () => {
    const reg = createRegistry();
    reg.register(echo);
    expect(() => reg.register(echo)).toThrow(/already registered/);
  });

  it('resolves latest version when multiple registered', () => {
    const reg = createRegistry();
    reg.register(echo);
    reg.register({
      ...echo,
      manifest: { ...echo.manifest, version: '2.0' },
    } as ActionDefinition);
    expect(reg.get('test:echo')!.manifest.version).toBe('2.0');
    expect(reg.get('test:echo', '1.0')!.manifest.version).toBe('1.0');
  });

  it('streams accepted → progress* → result for a successful invocation', async () => {
    const reg = createRegistry({ idGenerator: () => 'inv-1' });
    reg.register(echo);
    const events = await collect(reg.invoke(req()));
    expect(events).toEqual([
      { type: 'accepted', invocationId: 'inv-1' },
      { type: 'progress', data: { step: 1 } },
      { type: 'progress', data: { step: 2 } },
      { type: 'result', data: { echoed: 'hi' } },
    ]);
  });

  it('emits UNKNOWN_ACTION when action name is not registered', async () => {
    const reg = createRegistry();
    const events = await collect(reg.invoke(req({ action: 'nope:nope' })));
    expect(events).toEqual([
      { type: 'error', code: 'UNKNOWN_ACTION', message: expect.any(String), retryable: false },
    ]);
  });

  it('emits UNKNOWN_VERSION when a specific version is missing', async () => {
    const reg = createRegistry();
    reg.register(echo);
    const events = await collect(reg.invoke(req({ version: '9.9' })));
    expect(events[0]).toMatchObject({ type: 'error', code: 'UNKNOWN_VERSION' });
  });

  it('emits UNAUTHORIZED when caller lacks capability', async () => {
    const reg = createRegistry({ idGenerator: () => 'inv-2' });
    reg.register(echo);
    const events = await collect(reg.invoke(req({ capabilities: [] })));
    expect(events).toEqual([
      { type: 'accepted', invocationId: 'inv-2' },
      { type: 'error', code: 'UNAUTHORIZED', message: expect.any(String), retryable: false },
    ]);
  });

  it('accepts wildcard "*" capability', async () => {
    const reg = createRegistry();
    reg.register(echo);
    const events = await collect(reg.invoke(req({ capabilities: ['*'] })));
    expect(events.at(-1)).toMatchObject({ type: 'result' });
  });

  it('emits INVALID_INPUT when validateInput throws', async () => {
    const reg = createRegistry();
    reg.register(
      action<{ n: number }, { n: number }, never>({
        manifest: { ...echo.manifest, name: 'test:num', capability: 'test.read' },
        validateInput: (raw) => {
          if (typeof (raw as { n: unknown }).n !== 'number') throw new Error('n must be number');
          return raw as { n: number };
        },
        async *execute(_ctx, input) {
          yield undefined as never;
          return input;
        },
      })
    );
    const events = await collect(reg.invoke(req({ action: 'test:num', input: { n: 'no' } })));
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'INVALID_INPUT' });
  });

  it('emits EXECUTION_FAILED for thrown errors', async () => {
    const reg = createRegistry();
    reg.register(boom);
    const events = await collect(
      reg.invoke(req({ action: 'test:boom', input: {}, capabilities: ['test.write'] }))
    );
    expect(events.at(-1)).toMatchObject({
      type: 'error',
      code: 'EXECUTION_FAILED',
      message: 'kaboom',
    });
  });

  it('dedups on idempotencyKey — second call yields DUPLICATE_INVOCATION', async () => {
    const reg = createRegistry();
    reg.register(echo);
    const first = await collect(reg.invoke(req({ idempotencyKey: 'k1' })));
    expect(first.at(-1)).toMatchObject({ type: 'result' });
    const second = await collect(reg.invoke(req({ idempotencyKey: 'k1' })));
    expect(second.at(-1)).toMatchObject({ type: 'error', code: 'DUPLICATE_INVOCATION' });
  });

  it('stops and emits CANCELED when signal aborts mid-stream', async () => {
    const reg = createRegistry();
    reg.register(
      action<Record<string, never>, { done: true }, { step: number }>({
        manifest: { ...echo.manifest, name: 'test:slow' },
        async *execute(ctx) {
          for (let i = 0; i < 10; i++) {
            if (ctx.signal.aborted) return { done: true };
            yield { step: i };
            await new Promise((r) => setTimeout(r, 0));
          }
          return { done: true };
        },
      })
    );

    const ac = new AbortController();
    const gen = reg.invoke(req({ action: 'test:slow', input: {} }), ac.signal);
    const events: InvokeEvent[] = [];
    let i = 0;
    for await (const e of gen) {
      events.push(e);
      if (i++ === 2) ac.abort();
    }
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'CANCELED' });
  });

  it('emits DEPRECATED when action is marked deprecated', async () => {
    const reg = createRegistry();
    reg.register({
      ...echo,
      manifest: { ...echo.manifest, deprecatedSince: '2026-04-01' },
    } as ActionDefinition);
    const events = await collect(reg.invoke(req()));
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'DEPRECATED' });
  });
});
