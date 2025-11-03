import type { Message } from './message.types.js';

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
export interface Tool<TParams = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<Message[]>;
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
 * Tool creation configuration with generic type support
 */
export interface CreateToolConfig<TParams = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<Message[]>;
}

/**
 * Tool factory function type
 */
export type ToolFactory = <TParams = unknown>(
  config: CreateToolConfig<TParams>
) => Tool<TParams>;
