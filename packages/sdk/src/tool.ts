import type { CreateToolConfig, InferSchemaType, Tool } from '@agentage/core';

/**
 * Create a tool with the given configuration
 * The params type is automatically inferred from the schema
 */
export function tool<TSchema = unknown>(
  config: CreateToolConfig<TSchema>
): Tool<InferSchemaType<TSchema>> {
  return {
    name: config.name,
    description: config.description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: config.schema as any,
    execute: config.execute,
  };
}
