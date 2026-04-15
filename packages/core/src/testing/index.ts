/**
 * Test fixtures for agents, combinators, and orchestration.
 *
 *   import { makeFakeAgent, collectEvents, mockRegistry } from '@agentage/core/testing';
 */
import type {
  Agent,
  AgentProcess,
  AgentRegistry,
  AgentRuntime,
  RunEvent,
  RunInput,
  CtxRunResult,
} from '../types.js';
import { result as resultEvent, output as outputEvent } from '../events.js';
import { agent as buildAgent } from '../agent.js';

export interface FakeAgentOptions {
  name?: string;
  description?: string;
  /** Events to yield before the final result. Defaults to []. */
  events?: RunEvent[];
  /** Payload for the final result event (success=true). Mutually exclusive with `fail`. */
  output?: unknown;
  /** When set, the agent yields result(false, …). */
  fail?: string | boolean;
  /** Optional delay per event (milliseconds). */
  delayMs?: number;
  /** inputSchema / outputSchema for composition tests. */
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

/**
 * Build a deterministic agent for tests. Yields `events` (if any), then a final
 * result event, honoring cancellation between yields.
 */
export const makeFakeAgent = (opts: FakeAgentOptions = {}): Agent =>
  buildAgent({
    name: opts.name ?? 'fake',
    description: opts.description,
    inputSchema: opts.inputSchema,
    outputSchema: opts.outputSchema,
    async *run(_input, ctx) {
      for (const event of opts.events ?? []) {
        if (ctx.signal.aborted) return;
        if (opts.delayMs) await ctx.sleep(opts.delayMs);
        yield event;
      }
      if (opts.fail) {
        yield resultEvent(false, typeof opts.fail === 'string' ? opts.fail : 'fake agent failed');
      } else {
        yield resultEvent(true, opts.output);
      }
    },
  });

export interface CollectedRun {
  events: RunEvent[];
  result: CtxRunResult | null;
}

/**
 * Run an agent to completion, collecting all events and the final result.
 * Safe default timeout (1s) prevents runaway tests.
 */
export const collectEvents = async (
  agent: Agent,
  input: RunInput = { task: '' },
  runtime?: AgentRuntime,
  options: { timeoutMs?: number } = {}
): Promise<CollectedRun> => {
  const process: AgentProcess = await agent.run(input, runtime);
  const events: RunEvent[] = [];
  let result: CtxRunResult | null = null;

  const timeoutMs = options.timeoutMs ?? 1000;
  const timer = setTimeout(() => process.cancel(), timeoutMs);

  try {
    for await (const event of process.events) {
      events.push(event);
      if (event.data.type === 'result') {
        result = {
          success: event.data.success,
          output: event.data.output,
        };
      }
    }
  } finally {
    clearTimeout(timer);
  }

  return { events, result };
};

/**
 * In-memory registry for tests. Accepts either Agent instances or factory
 * functions (useful for simulating resolution delays).
 */
export const mockRegistry = (
  agents: Record<string, Agent | (() => Promise<Agent | null>)>
): AgentRegistry => ({
  async resolve(ref: string) {
    const entry = agents[ref];
    if (!entry) return null;
    if (typeof entry === 'function') return entry();
    return entry;
  },
});

/** Shortcut for building a single output event — handy in makeFakeAgent({ events }). */
export const fakeOutput = (line: string): RunEvent => outputEvent(line);
