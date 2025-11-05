import type { ModelConfig, ModelDefinition } from './model.types.js';
import type { Tool, ToolCall } from './tool.types.js';

/**
 * Agent configuration interface (for config object pattern)
 */
export interface AgentConfig {
  name: string;
  model: string | ModelDefinition;
  instructions?: string;
  tools?: Tool<unknown, unknown>[];
}

/**
 * Agent response interface
 */
export interface AgentResponse<T = unknown> {
  content: string;
  metadata?: Record<string, unknown>;
  data?: T;
  toolCalls?: ToolCall[];
}

/**
 * Agent interface with builder pattern support
 */
export interface Agent {
  model(modelName: string, config?: ModelConfig): Agent;
  instructions(text: string): Agent;
  tools<TParams = unknown, TResult = unknown>(
    toolList: Tool<TParams, TResult>[]
  ): Agent;
  config(configEntries: Array<{ key: string; value: string }>): Agent;
  send(message: string): Promise<AgentResponse>;
  stream(message: string): AsyncIterableIterator<AgentResponse>;
}

/**
 * Agent factory function type (supports both builder and config patterns)
 */
export type AgentFactory = {
  (name: string): Agent;
  (config: AgentConfig): Agent;
};
