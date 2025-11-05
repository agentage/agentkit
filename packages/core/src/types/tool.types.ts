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
 * Infer the type from a schema
 */
export type InferSchemaType<TSchema> = TSchema extends {
  parse: (data: unknown) => infer T;
}
  ? T
  : TSchema extends { _type: infer T }
  ? T
  : TSchema extends Record<string, { parse?: (data: unknown) => unknown }>
  ? {
      [K in keyof TSchema]: TSchema[K] extends {
        parse?: (data: unknown) => infer U;
      }
        ? U
        : never;
    }
  : unknown;

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
 * Tool call result
 */
export interface ToolCall {
  name: string;
  params: unknown;
  result: unknown;
}

/**
 * Tool creation configuration with automatic type inference from schema
 */
export interface CreateToolConfig<TSchema = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema: TSchema;
}

/**
 * Tool execute function type
 */
export type ToolExecuteFunction<TSchema = unknown, TResult = unknown> = (
  params: InferSchemaType<TSchema>
) => Promise<TResult>;

/**
 * Tool factory function type with automatic type inference
 */
export type ToolFactory = <TSchema = unknown, TResult = unknown>(
  config: CreateToolConfig<TSchema>,
  execute: ToolExecuteFunction<TSchema, TResult>
) => Tool<InferSchemaType<TSchema>, TResult>;
