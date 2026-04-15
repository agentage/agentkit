import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { defineAgent } from './index.js';

describe('defineAgent', () => {
  it('builds manifest with JSON Schema derived from Zod inputs', () => {
    const a = defineAgent({
      name: 'pr-reviewer',
      description: 'reviews PRs',
      inputs: z.object({
        prUrl: z.string().url().describe('GitHub PR URL'),
        focus: z.enum(['security', 'perf', 'style']).optional(),
      }),
    });

    const schema = a.manifest.inputSchema;
    expect(schema).toBeDefined();
    expect(schema).toMatchObject({
      type: 'object',
      properties: {
        prUrl: { type: 'string', format: 'uri', description: 'GitHub PR URL' },
        focus: { enum: ['security', 'perf', 'style'] },
      },
      required: ['prUrl'],
    });
  });

  it('emits Draft 7 JSON Schema', () => {
    const a = defineAgent({
      name: 't',
      inputs: z.object({ x: z.string() }),
    });
    expect((a.manifest.inputSchema as { $schema?: string }).$schema).toBe(
      'http://json-schema.org/draft-07/schema#'
    );
  });

  it('builds manifest with outputSchema derived from Zod outputs', () => {
    const a = defineAgent({
      name: 't',
      outputs: z.object({ verdict: z.enum(['approve', 'reject']) }),
    });
    expect(a.manifest.outputSchema).toMatchObject({
      type: 'object',
      properties: { verdict: { enum: ['approve', 'reject'] } },
      required: ['verdict'],
    });
  });

  it('omits schemas when not provided', () => {
    const a = defineAgent({ name: 't' });
    expect(a.manifest.inputSchema).toBeUndefined();
    expect(a.manifest.outputSchema).toBeUndefined();
  });

  it('forwards other manifest fields unchanged', () => {
    const a = defineAgent({
      name: 'x',
      description: 'd',
      version: '1.2.3',
      tags: ['foo'],
      inputs: z.object({}),
    });
    expect(a.manifest.name).toBe('x');
    expect(a.manifest.description).toBe('d');
    expect(a.manifest.version).toBe('1.2.3');
    expect(a.manifest.tags).toEqual(['foo']);
  });

  it('supports declarative (LLM) agents', () => {
    const a = defineAgent({
      name: 'llm',
      model: 'claude-sonnet-4-6',
      prompt: 'you are a helper',
      inputs: z.object({ question: z.string() }),
    });
    expect(a.manifest.config).toMatchObject({
      model: 'claude-sonnet-4-6',
      prompt: 'you are a helper',
    });
    expect(a.manifest.inputSchema).toBeDefined();
  });
});
