import type {
  AgentConfig,
  AgentResponse,
  ModelConfig,
  Tool,
} from './agent.types.js';

describe('Agent Types', () => {
  test('AgentConfig interface is properly structured', () => {
    const config: AgentConfig = {
      name: 'test-agent',
      model: 'gpt-4',
      instructions: 'You are a helpful assistant',
      temperature: 0.7,
    };

    expect(config.name).toBe('test-agent');
    expect(config.model).toBe('gpt-4');
  });

  test('ModelConfig interface is properly structured', () => {
    const modelConfig: ModelConfig = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
    };

    expect(modelConfig.temperature).toBe(0.7);
  });

  test('Tool interface is properly structured', () => {
    const tool: Tool = {
      name: 'test-tool',
      description: 'A test tool',
      schema: { type: 'object' },
      execute: async (params) => params,
    };

    expect(tool.name).toBe('test-tool');
  });

  test('AgentResponse interface is properly structured', () => {
    const response: AgentResponse = {
      content: 'Hello, how can I help?',
      metadata: { tokens: 10 },
    };

    expect(response.content).toBeDefined();
  });
});
