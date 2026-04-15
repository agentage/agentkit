/**
 * Zod helper for authoring agents with typed, validated I/O.
 *
 * Requires `zod >= 4.0.0` as a peer dependency. Import from `@agentage/core/zod`
 * to opt in; `@agentage/core` itself stays dep-free.
 *
 *   import { defineAgent } from '@agentage/core/zod';
 *   import { z } from 'zod';
 *
 *   export default defineAgent({
 *     name: 'pr-reviewer',
 *     inputs: z.object({ prUrl: z.string().url().describe('PR URL') }),
 *     outputs: z.object({ verdict: z.enum(['approve', 'request_changes', 'comment']) }),
 *     async *run({ config }, ctx) { ... },
 *   });
 */
import { z, type ZodType } from 'zod';
import { agent } from '../agent.js';
import type { Agent, AgentConfig, JsonSchema } from '../types.js';

export interface DefineAgentConfig<I = unknown, O = unknown> extends Omit<
  AgentConfig,
  'inputSchema' | 'outputSchema'
> {
  inputs?: ZodType<I>;
  outputs?: ZodType<O>;
}

const toSchema = (schema: ZodType | undefined): JsonSchema | undefined => {
  if (!schema) return undefined;
  return z.toJSONSchema(schema, { target: 'draft-7' }) as JsonSchema;
};

export const defineAgent = <I = unknown, O = unknown>(config: DefineAgentConfig<I, O>): Agent => {
  const { inputs, outputs, ...rest } = config;
  return agent({
    ...rest,
    inputSchema: toSchema(inputs),
    outputSchema: toSchema(outputs),
  });
};
