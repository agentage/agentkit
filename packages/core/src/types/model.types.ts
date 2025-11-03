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
