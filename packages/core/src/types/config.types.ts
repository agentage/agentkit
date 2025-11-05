/**
 * Configuration entry for agent runtime
 */
export interface ConfigEntry {
  key: string;
  value: string;
  scope?: string[];
}

/**
 * Runtime configuration for agents
 */
export interface RuntimeConfig {
  /**
   * Configuration entries
   */
  entries: ConfigEntry[];
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  /**
   * API keys and secrets
   */
  apiKeys?: Record<string, string>;

  /**
   * Environment variables
   */
  env?: Record<string, string>;

  /**
   * Timeout settings in milliseconds
   */
  timeout?: number;

  /**
   * Retry configuration
   */
  retry?: {
    maxAttempts?: number;
    backoff?: number;
  };
}
