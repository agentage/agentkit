/**
 * Model configuration options
 */
export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
}

/**
 * Model definition with name and optional config
 */
export interface ModelDefinition {
  name: string;
  config?: ModelConfig;
}

/**
 * Tool schema definition - can be any schema validator (e.g., Zod schema)
 */
export type ToolSchema<T = unknown> =
  | {
      parse?: (data: unknown) => T;
      safeParse?: (data: unknown) => {
        success: boolean;
        data?: T;
        error?: unknown;
      };
      _type?: T;
    }
  | Record<string, unknown>;

/**
 * Tool definition interface with generic type support
 */
export interface Tool<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}

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
 * Tool call result
 */
export interface ToolCall {
  name: string;
  params: unknown;
  result: unknown;
}

/**
 * Agent interface with builder pattern support
 */
export interface Agent {
  model(modelName: string, config?: ModelConfig): Agent;
  instructions(text: string): Agent;
  tools(toolList: Tool<unknown, unknown>[]): Agent;
  send(message: string): Promise<AgentResponse>;
  stream(message: string): AsyncIterableIterator<AgentResponse>;
}
