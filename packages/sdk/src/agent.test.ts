import type { Tool } from '@agentage/core';
import { z } from 'zod';
import { agent, convertToOpenAITool } from './agent';
import { tool } from './tool';

describe('Agent', () => {
  describe('convertToOpenAITool', () => {
    it('should convert tool name to OpenAI function name', () => {
      const searchTool = tool(
        {
          name: 'search',
          description: 'Search the web',
          inputSchema: {
            query: z.string().describe('Search query'),
          },
        },
        async () => []
      );

      const result = convertToOpenAITool(searchTool);

      expect(result).toEqual({
        type: 'function',
        function: {
          name: 'search',
          description: 'Search the web',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
            },
            required: ['query'],
          },
        },
      });
    });
  });

  describe('agent builder', () => {
    it('should create agent with tools', () => {
      const searchTool = tool(
        {
          name: 'search',
          description: 'Search',
          inputSchema: {
            query: z.string(),
          },
        },
        async () => []
      );

      const assistant = agent('assistant').tools([
        searchTool as Tool<unknown, unknown>,
      ]);

      const config = (assistant as any).getConfig();
      expect(config.tools).toHaveLength(1);
      expect(config.tools[0].name).toBe('search');
    });
  });
});
