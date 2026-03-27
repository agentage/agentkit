import { describe, expect, it } from 'vitest';
import { mcp } from './mcp.js';

describe('mcp', () => {
  it('creates stdio MCP config', () => {
    const server = mcp({
      name: 'github',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_TOKEN: 'test' },
    });
    expect(server.name).toBe('github');
    expect(server.command).toBe('npx');
    expect(server.args).toEqual(['-y', '@modelcontextprotocol/server-github']);
    expect(server.env).toEqual({ GITHUB_TOKEN: 'test' });
  });

  it('creates HTTP MCP config', () => {
    const server = mcp({
      name: 'remote',
      type: 'http',
      url: 'https://api.example.com/mcp',
      headers: { Authorization: 'Bearer test' },
    });
    expect(server.name).toBe('remote');
    expect(server.type).toBe('http');
    expect(server.url).toBe('https://api.example.com/mcp');
  });

  it('preserves all fields', () => {
    const config = {
      name: 'fs',
      type: 'stdio' as const,
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    };
    expect(mcp(config)).toEqual(config);
  });
});
