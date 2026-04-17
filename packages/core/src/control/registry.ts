import { ActionError } from './errors.js';
import type {
  ActionContext,
  ActionDefinition,
  ActionManifest,
  ActionRegistry,
  InvokeEvent,
  InvokeRequest,
} from './types.js';

const LATEST = 'latest';

const makeKey = (name: string, version: string): string => `${name}@${version}`;

const pickLatest = (versions: Map<string, ActionDefinition>): ActionDefinition | undefined => {
  let chosen: { key: string; def: ActionDefinition } | undefined;
  for (const [key, def] of versions) {
    if (!chosen || key.localeCompare(chosen.key, undefined, { numeric: true }) > 0) {
      chosen = { key, def };
    }
  }
  return chosen?.def;
};

const validateInput = <I>(def: ActionDefinition<I, unknown, unknown>, input: unknown): I => {
  if (!def.validateInput) return input as I;
  try {
    return def.validateInput(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ActionError('INVALID_INPUT', message);
  }
};

const assertAuthorized = (need: string, have: ReadonlySet<string>): void => {
  if (!have.has(need) && !have.has('*')) {
    throw new ActionError('UNAUTHORIZED', `Missing capability: ${need}`);
  }
};

const assertNotDeprecated = (manifest: ActionManifest): void => {
  if (manifest.deprecatedSince) {
    throw new ActionError(
      'DEPRECATED',
      `${manifest.name}@${manifest.version} deprecated since ${manifest.deprecatedSince}`
    );
  }
};

interface InvocationRecord {
  invocationId: string;
  key: string;
  result: Promise<unknown>;
}

export const createRegistry = (options?: { idGenerator?: () => string }): ActionRegistry => {
  const actions = new Map<string, Map<string, ActionDefinition>>();
  const idempotency = new Map<string, InvocationRecord>();
  const nextId = options?.idGenerator ?? (() => crypto.randomUUID());

  const resolve = (name: string, version?: string): ActionDefinition | undefined => {
    const versions = actions.get(name);
    if (!versions) return undefined;
    if (!version || version === LATEST) return pickLatest(versions);
    return versions.get(version);
  };

  return {
    register<I, O, P>(def: ActionDefinition<I, O, P>): void {
      const { name, version } = def.manifest;
      let versions = actions.get(name);
      if (!versions) {
        versions = new Map();
        actions.set(name, versions);
      }
      if (versions.has(version)) {
        throw new Error(`Action already registered: ${makeKey(name, version)}`);
      }
      versions.set(version, def as ActionDefinition);
    },

    list(): ActionManifest[] {
      const out: ActionManifest[] = [];
      for (const versions of actions.values()) {
        for (const def of versions.values()) out.push(def.manifest);
      }
      return out;
    },

    get(name, version) {
      return resolve(name, version);
    },

    async *invoke(req: InvokeRequest, signal?: AbortSignal): AsyncGenerator<InvokeEvent> {
      const def = resolve(req.action, req.version);
      if (!def) {
        yield {
          type: 'error',
          code: req.version ? 'UNKNOWN_VERSION' : 'UNKNOWN_ACTION',
          message: `Action not found: ${req.action}${req.version ? `@${req.version}` : ''}`,
          retryable: false,
        };
        return;
      }

      const invocationId = nextId();
      const idemKey = req.idempotencyKey
        ? `${def.manifest.name}@${def.manifest.version}#${req.idempotencyKey}`
        : undefined;

      if (idemKey && idempotency.has(idemKey)) {
        const prev = idempotency.get(idemKey)!;
        yield { type: 'accepted', invocationId: prev.invocationId };
        yield {
          type: 'error',
          code: 'DUPLICATE_INVOCATION',
          message: 'Replay of prior invocation',
          retryable: false,
        };
        return;
      }

      yield { type: 'accepted', invocationId };

      try {
        assertNotDeprecated(def.manifest);
        assertAuthorized(def.manifest.capability, new Set(req.capabilities));
        const input = validateInput(def, req.input);

        const ctx: ActionContext = {
          invocationId,
          callerId: req.callerId,
          capabilities: new Set(req.capabilities),
          idempotencyKey: req.idempotencyKey,
          signal: signal ?? new AbortController().signal,
        };

        const gen = def.execute(ctx, input);
        let finalResult: unknown;
        while (true) {
          if (ctx.signal.aborted) {
            yield {
              type: 'error',
              code: 'CANCELED',
              message: 'Invocation canceled',
              retryable: true,
            };
            return;
          }
          const step = await gen.next();
          if (step.done) {
            finalResult = step.value;
            break;
          }
          yield { type: 'progress', data: step.value };
        }
        if (idemKey) {
          idempotency.set(idemKey, {
            invocationId,
            key: idemKey,
            result: Promise.resolve(finalResult),
          });
        }
        yield { type: 'result', data: finalResult };
      } catch (err) {
        if (err instanceof ActionError) {
          yield { type: 'error', code: err.code, message: err.message, retryable: err.retryable };
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        yield { type: 'error', code: 'EXECUTION_FAILED', message, retryable: true };
      }
    },
  };
};
