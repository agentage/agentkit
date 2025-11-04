import { agent } from './agent';
import { tool } from './tool';

describe('SDK', () => {
  describe('agent builder pattern', () => {
    it('should create agent with builder pattern', () => {
      const assistant = agent('assistant')
        .model('gpt-4', { temperature: 0.7 })
        .instructions('You are helpful');

      const config = (assistant as any).getConfig();
      expect(config.name).toBe('assistant');
      expect(config.model).toEqual({
        name: 'gpt-4',
        config: { temperature: 0.7 },
      });
      expect(config.instructions).toBe('You are helpful');
    });

    it('should create agent with config object', () => {
      const assistant = agent({
        name: 'assistant',
        model: 'gpt-4',
        instructions: 'You are helpful',
      });

      const config = (assistant as any).getConfig();
      expect(config.name).toBe('assistant');
      expect(config.model).toBe('gpt-4');
    });

    it('should create agent with config object with model definition', () => {
      const assistant = agent({
        name: 'assistant',
        model: {
          name: 'gpt-4',
          config: { temperature: 0.5 },
        },
        instructions: 'You are helpful',
      });

      const config = (assistant as any).getConfig();
      expect(config.name).toBe('assistant');
      expect(config.model).toEqual({
        name: 'gpt-4',
        config: { temperature: 0.5 },
      });
    });

    it('should create agent with tools', () => {
      const searchTool = tool({
        name: 'search',
        description: 'Search',
        schema: {},
        execute: async () => [],
      });

      const assistant = agent('assistant').tools([searchTool]);

      const config = (assistant as any).getConfig();
      expect(config.tools).toHaveLength(1);
      expect(config.tools[0].name).toBe('search');
    });

    it('should create agent with config method', () => {
      const assistant = agent('test').config([
        { key: 'OPENAI_API_KEY', value: 'test-key' },
      ]);

      expect(assistant).toBeDefined();
    });

    it('should create agent with default model', () => {
      const assistant = agent('test');
      const config = (assistant as any).getConfig();
      expect(config.name).toBe('test');
      expect(config.model).toBe('gpt-4');
    });

    it('should throw error when send is called without API key', async () => {
      const assistant = agent('test').model('gpt-4');
      await expect(assistant.send('hello')).rejects.toThrow('API key required');
    });

    it('should throw error for unsupported model', async () => {
      const assistant = agent('test')
        .model('claude-3')
        .config([{ key: 'OPENAI_API_KEY', value: 'fake-key' }]);
      await expect(assistant.send('hello')).rejects.toThrow('not supported');
    });

    it('should throw error for stream method', async () => {
      const assistant = agent('test');
      const streamGen = assistant.stream('hello');
      await expect(streamGen.next()).rejects.toThrow('not yet implemented');
    });
  });

  describe('tool factory', () => {
    it('should create tool', async () => {
      const searchTool = tool({
        name: 'search',
        description: 'Search the web',
        schema: {},
        execute: async () => [
          { role: 'tool', content: 'result', toolCallId: 'call_1' },
        ],
      });

      expect(searchTool.name).toBe('search');
      expect(searchTool.description).toBe('Search the web');
      const result = await searchTool.execute({});
      expect(result).toHaveLength(1);
    });

    it('should create tool with schema', () => {
      const searchTool = tool({
        name: 'search',
        description: 'Search the web',
        schema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
        execute: async () => [],
      });

      expect(searchTool.schema).toEqual({
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
      });
    });
  });
});
