/**
 * Agent configuration interface
 */
export interface AgentConfig {
  name: string;
  model: string;
  temperature?: number;
  instructions?: string;
  tools?: Tool[];
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Tool schema definition
 */
export interface ToolSchema {
  [key: string]: unknown;
}

/**
 * Tool definition interface
 */
export interface Tool {
  name: string;
  description: string;
  schema: ToolSchema;
  execute: (params: unknown) => Promise<unknown>;
}

/**
 * Agent response interface
 */
export interface AgentResponse {
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Agent interface with builder pattern support
 */
export interface Agent {
  model(modelName: string, config?: ModelConfig): Agent;
  instructions(text: string): Agent;
  tools(toolList: Tool[]): Agent;
  send(message: string): Promise<AgentResponse>;
}
