import type {
  CreateToolConfig,
  Tool,
  ToolCall,
  ToolSchema,
} from './tool.types';

describe('Tool Types', () => {
  describe('Tool', () => {
    it('should allow basic tool definition', async () => {
      const tool: Tool = {
        name: 'search',
        description: 'Search tool',
        schema: {},
        execute: async () => [
          { role: 'tool', content: 'result', toolCallId: 'call_1' },
        ],
      };
      expect(tool.name).toBe('search');
      const result = await tool.execute({ query: 'test' });
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('tool');
    });

    it('should allow typed tool with generics', async () => {
      interface SearchParams {
        query: string;
      }

      const tool: Tool<SearchParams> = {
        name: 'search',
        description: 'Search tool',
        schema: {},
        execute: async (params) => [
          {
            role: 'tool',
            content: JSON.stringify({ results: [params.query] }),
            toolCallId: 'call_1',
          },
        ],
      };

      const result = await tool.execute({ query: 'test' });
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('tool');
      expect(result[0].content).toContain('test');
    });
  });

  describe('ToolSchema', () => {
    it('should allow zod-like schema with parse', () => {
      const schema = {
        parse: (data: unknown) => String(data),
      } as ToolSchema<string>;

      expect(schema).toHaveProperty('parse');
    });

    it('should allow zod-like schema with safeParse', () => {
      const schema = {
        safeParse: (data: unknown) => ({
          success: true,
          data: String(data),
        }),
      } as ToolSchema<string>;

      expect(schema).toHaveProperty('safeParse');
    });

    it('should allow plain object schema', () => {
      const schema: ToolSchema = {
        type: 'object',
        properties: {},
      };
      expect(schema.type).toBe('object');
    });
  });

  describe('ToolCall', () => {
    it('should allow tool call result', () => {
      const toolCall: ToolCall = {
        name: 'search',
        params: { query: 'test' },
        result: { found: true },
      };
      expect(toolCall.name).toBe('search');
      expect(toolCall.params).toEqual({ query: 'test' });
      expect(toolCall.result).toEqual({ found: true });
    });
  });

  describe('CreateToolConfig', () => {
    it('should allow tool creation config', () => {
      const config: CreateToolConfig = {
        name: 'test',
        description: 'Test tool',
        schema: {},
        execute: async () => [
          { role: 'tool', content: '{}', toolCallId: 'call_1' },
        ],
      };
      expect(config.name).toBe('test');
    });
  });
});
