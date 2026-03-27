import { describe, expect, it } from 'vitest';
import { tool } from './tool.js';

describe('tool', () => {
  it('returns config as-is', () => {
    const config = {
      name: 'health_check',
      description: 'Check endpoint health',
      input: { type: 'object', properties: { url: { type: 'string' } } },
      execute: async ({ url }: { url: string }) => ({ status: 200, ok: true, url }),
    };
    const t = tool(config);
    expect(t.name).toBe('health_check');
    expect(t.description).toBe('Check endpoint health');
    expect(t.execute).toBe(config.execute);
  });

  it('preserves all fields', () => {
    const config = {
      name: 'deploy',
      description: 'Deploy service',
      input: {},
      execute: () => 'deployed',
    };
    const t = tool(config);
    expect(t).toEqual(config);
  });
});
