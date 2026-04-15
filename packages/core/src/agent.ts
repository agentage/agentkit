import type {
  Agent,
  AgentConfig,
  AgentProcess,
  AgentRuntime,
  CtxRunFn,
  CtxRunResult,
  RunContext,
  RunEvent,
  RunInput,
} from './types.js';
import { result as resultEvent } from './events.js';

/** Default recursion cap — ship conservative, surface via daemon config later. */
export const DEFAULT_DEPTH_LIMIT = 50;

const NO_REGISTRY_ERROR =
  'ctx.run(): no registry configured. Run this agent through a daemon that provides one, or pass { registry } via Agent.run(input, runtime).';

/** Build a ctx.run function given the runtime plumbing. */
export const makeCtxRun = (runtime: AgentRuntime, signal: AbortSignal): CtxRunFn => {
  const depth = runtime.depth ?? 0;

  return async function* ctxRun<O = unknown>(
    ref: string | Agent,
    input: RunInput
  ): AsyncGenerator<RunEvent, CtxRunResult<O>, void> {
    // Daemon-provided dispatch takes precedence (handles linkage + persistence).
    if (runtime.dispatch) {
      return (yield* runtime.dispatch<O>(ref, input)) as CtxRunResult<O>;
    }

    if (signal.aborted) {
      return { success: false, error: 'parent aborted' };
    }

    if (depth + 1 > DEFAULT_DEPTH_LIMIT) {
      return {
        success: false,
        error: `ctx.run depth limit exceeded (${DEFAULT_DEPTH_LIMIT})`,
      };
    }

    let resolved: Agent | null;
    if (typeof ref === 'string') {
      if (!runtime.registry) {
        return { success: false, error: NO_REGISTRY_ERROR };
      }
      resolved = await runtime.registry.resolve(ref);
      if (!resolved) {
        return { success: false, error: `agent "${ref}" not found` };
      }
    } else {
      resolved = ref;
    }

    const childProcess = await resolved.run(input, {
      ...runtime,
      depth: depth + 1,
    });

    // Cascade cancellation: when parent aborts, cancel child.
    const onAbort = (): void => childProcess.cancel();
    signal.addEventListener('abort', onAbort, { once: true });

    let childResult: CtxRunResult<O> = { success: true };
    try {
      for await (const event of childProcess.events) {
        yield event;
        if (event.data.type === 'result') {
          childResult = {
            success: event.data.success,
            output: event.data.output as O,
            error: event.data.success ? undefined : 'child run returned unsuccessful result',
          };
        }
      }
    } finally {
      signal.removeEventListener('abort', onAbort);
    }

    return childResult;
  };
};

const abortSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });

/** Auto-generate a run function for declarative agents with model config */
const createDeclarativeRun = (
  config: AgentConfig
): ((input: RunInput, ctx: RunContext) => AsyncIterable<RunEvent>) =>
  async function* (input: RunInput, ctx: RunContext): AsyncIterable<RunEvent> {
    const { claude } = await import('./adapters/claude.js');
    const tools = Array.isArray(config.tools)
      ? config.tools.filter((t): t is string => typeof t === 'string')
      : undefined;

    yield* claude(input.task, {
      signal: ctx.signal,
      model: config.model,
      systemPrompt: config.prompt,
      tools,
      maxTurns: config.maxTurns,
      mcpServers: config.mcp ? Object.fromEntries(config.mcp.map((m) => [m.name, m])) : undefined,
    });
  };

/** Create an agent from a config object */
export const agent = (config: AgentConfig): Agent => {
  const declarativeConfig: Record<string, unknown> = {};
  if (config.model) declarativeConfig.model = config.model;
  if (config.prompt) declarativeConfig.prompt = config.prompt;
  if (config.tools) declarativeConfig.tools = config.tools;
  if (config.mcp) declarativeConfig.mcp = config.mcp;
  if (config.temperature !== undefined) declarativeConfig.temperature = config.temperature;
  if (config.maxTurns !== undefined) declarativeConfig.maxTurns = config.maxTurns;

  const manifest = {
    name: config.name ?? '',
    description: config.description,
    version: config.version,
    tags: config.tags,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    path: '',
    ...(Object.keys(declarativeConfig).length > 0 ? { config: declarativeConfig } : {}),
  };

  const runFn = config.run ?? (config.model ? createDeclarativeRun(config) : undefined);

  return {
    manifest,
    async run(input: RunInput, runtime: AgentRuntime = {}): Promise<AgentProcess> {
      const runId = crypto.randomUUID();
      const controller = new AbortController();
      const { signal } = controller;

      const ctx: RunContext = {
        signal,
        sleep: (ms: number) => abortSleep(ms, signal),
        run: makeCtxRun(runtime, signal),
        parentRunId: runtime.parentRunId,
        depth: runtime.depth ?? 0,
      };

      async function* wrappedEvents(): AsyncGenerator<RunEvent> {
        let yieldedResult = false;

        try {
          if (runFn) {
            for await (const event of runFn(input, ctx)) {
              if (signal.aborted) break;
              if (event.type === 'result') yieldedResult = true;
              yield event;
            }
          }

          if (!yieldedResult && !signal.aborted) {
            yield resultEvent(true);
          }
        } catch (err: unknown) {
          if (!signal.aborted) {
            const message = err instanceof Error ? err.message : String(err);
            yield resultEvent(false, message);
          }
        }
      }

      return {
        runId,
        events: wrappedEvents(),
        cancel() {
          controller.abort();
        },
        sendInput() {},
      };
    },
  };
};
