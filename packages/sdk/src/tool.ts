import type {
  CreateToolConfig,
  InferSchemaType,
  Tool,
  ToolExecuteFunction,
} from '@agentage/core';

/**
 * Create a tool with the given configuration
 * The params type is automatically inferred from the schema
 */
export function tool<TSchema = unknown, TResult = unknown>(
  config: CreateToolConfig<TSchema>,
  execute: ToolExecuteFunction<TSchema, TResult>
): Tool<InferSchemaType<TSchema>, TResult> {
  return {
    name: config.name,
    description: config.description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: config.inputSchema as any,
    execute,
  };
}
