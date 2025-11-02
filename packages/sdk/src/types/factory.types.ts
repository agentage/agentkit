import type { Agent, AgentConfig } from './agent.types.js';

/**
 * Tool creation configuration
 */
export interface CreateToolConfig<TSchema = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: TSchema;
  execute: (params: unknown) => Promise<TResult>;
}

/**
 * Agent factory function type
 */
export type AgentFactory = {
  (name: string): Agent;
  (config: AgentConfig): Agent;
};
