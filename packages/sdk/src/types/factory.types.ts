import type {
  Agent,
  AgentConfig,
  CreateToolConfig,
  Tool,
  ToolExecuteFunction,
} from '@agentage/core';

/**
 * Tool factory function type
 */
export type ToolFactory = <TParams = unknown, TResult = unknown>(
  config: CreateToolConfig<TParams>,
  execute: ToolExecuteFunction<TParams, TResult>
) => Tool<TParams, TResult>;

/**
 * Agent factory function type (supports both builder and config patterns)
 */
export type AgentFactory = {
  (name: string): Agent;
  (config: AgentConfig): Agent;
};
