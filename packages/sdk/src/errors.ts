/**
 * Base error class for SDK errors
 */
export class AgentKitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentKitError';
  }
}

/**
 * Error thrown when a model is not supported
 */
export class UnsupportedModelError extends AgentKitError {
  constructor(modelName: string) {
    super(`Model ${modelName} is not supported`);
    this.name = 'UnsupportedModelError';
  }
}

/**
 * Error thrown when API key is missing
 */
export class MissingApiKeyError extends AgentKitError {
  constructor() {
    super('API key is required. Use .config([{ key: "OPENAI_API_KEY", value: "..." }])');
    this.name = 'MissingApiKeyError';
  }
}

/**
 * Error thrown when a tool is not found
 */
export class ToolNotFoundError extends AgentKitError {
  constructor(toolName: string) {
    super(`Tool "${toolName}" not found`);
    this.name = 'ToolNotFoundError';
  }
}

/**
 * Error thrown when a feature is not implemented
 */
export class NotImplementedError extends AgentKitError {
  constructor(feature: string) {
    super(`${feature} is not yet implemented`);
    this.name = 'NotImplementedError';
  }
}
