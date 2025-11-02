/**
 * SDK configuration options
 */
export interface SdkConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * SDK client interface
 */
export interface SdkClient {
  readonly config: SdkConfig;
  initialize(): Promise<void>;
}
