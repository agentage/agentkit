import type { Agent, AgentConfig, Tool } from './agent.types.js';

/**
 * Tool creation configuration with generic type support
 */
export interface CreateToolConfig<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: import('./agent.types.js').ToolSchema<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}

/**
 * Tool factory function type
 */
export type ToolFactory = <TParams = unknown, TResult = unknown>(
  config: CreateToolConfig<TParams, TResult>
) => Tool<TParams, TResult>;

/**
 * Agent factory function type (supports both builder and config patterns)
 */
export type AgentFactory = {
  (name: string): Agent;
  (config: AgentConfig): Agent;
};
