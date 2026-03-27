import type { Agent, AgentProcess, JsonSchema, RunEvent, RunInput, RunOptions } from './types.js';

interface CreateAgentConfig {
  name: string;
  description?: string;
  version?: string;
  tags?: string[];
  inputSchema?: JsonSchema;
  path: string;
  config?: Record<string, unknown>;
  run: (input: RunInput, options: RunOptions) => AsyncIterable<RunEvent>;
}

/** Convenience function that constructs an Agent object */
export const createAgent = (agentConfig: CreateAgentConfig): Agent => ({
  manifest: {
    name: agentConfig.name,
    description: agentConfig.description,
    version: agentConfig.version,
    tags: agentConfig.tags,
    inputSchema: agentConfig.inputSchema,
    path: agentConfig.path,
    config: agentConfig.config,
  },
  async run(input: RunInput): Promise<AgentProcess> {
    const runId = crypto.randomUUID();
    const controller = new AbortController();
    const events = agentConfig.run(input, { signal: controller.signal });

    return {
      runId,
      events,
      cancel() {
        controller.abort();
      },
      sendInput() {},
    };
  },
});
