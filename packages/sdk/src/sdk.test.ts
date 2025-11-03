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
  });
});
