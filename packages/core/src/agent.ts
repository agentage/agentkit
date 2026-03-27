import type { Agent, AgentConfig, AgentProcess, RunContext, RunEvent, RunInput } from './types.js';
import { result as resultEvent } from './events.js';

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
    path: '',
    ...(Object.keys(declarativeConfig).length > 0 ? { config: declarativeConfig } : {}),
  };

  return {
    manifest,
    async run(input: RunInput): Promise<AgentProcess> {
      const runId = crypto.randomUUID();
      const controller = new AbortController();
      const { signal } = controller;

      const ctx: RunContext = {
        signal,
        sleep: (ms: number) => abortSleep(ms, signal),
      };

      async function* wrappedEvents(): AsyncGenerator<RunEvent> {
        let yieldedResult = false;

        try {
          if (config.run) {
            for await (const event of config.run(input, ctx)) {
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
