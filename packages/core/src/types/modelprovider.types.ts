import type { Message } from './message.types.js';
import type { ModelConfig } from './model.types.js';
import type { ToolCall } from './tool.types.js';

/**
 * Supported model information
 */
export interface SupportedModel {
  /**
   * Model identifier (e.g., 'gpt-4', 'claude-3-opus')
   */
  name: string;

  /**
   * Model description
   */
  description?: string;

  /**
   * Default configuration for this model
   */
  defaultConfig?: ModelConfig;

  /**
   * Model capabilities
   */
  capabilities?: {
    streaming?: boolean;
    functionCalling?: boolean;
    vision?: boolean;
  };
}

/**
 * Model provider request
 */
export interface ModelRequest {
  messages: Message[];
  model: string;
  config?: ModelConfig;
  tools?: unknown[];
}

/**
 * Model provider response
 */
export interface ModelResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

/**
 * Model interface that providers must implement
 */
export interface Model {
  /**
   * Model name
   */
  readonly name: string;

  /**
   * Send a request to the model
   */
  send(request: ModelRequest): Promise<ModelResponse>;

  /**
   * Stream responses from the model
   */
  stream?(request: ModelRequest): AsyncIterableIterator<ModelResponse>;
}

/**
 * Model provider adapter interface
 */
export interface ModelProvider {
  /**
   * Provider name (e.g., 'openai', 'anthropic')
   */
  readonly name: string;

  /**
   * Get list of supported models with their configurations
   */
  getSupportedModels(): SupportedModel[];

  /**
   * Get a model instance by name
   */
  getModel(modelName: string, config?: ModelConfig): Model | null;

  /**
   * Check if the provider supports a specific model
   */
  supportsModel(modelName: string): boolean;
}
