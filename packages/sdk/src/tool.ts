import type { CreateToolConfig, Tool } from '@agentage/core';

/**
 * Create a tool with the given configuration
 */
export function tool<TParams = unknown>(
  config: CreateToolConfig<TParams>
): Tool<TParams> {
  return {
    name: config.name,
    description: config.description,
    schema: config.schema,
    execute: config.execute,
  };
}
