import type {
  AgentConfig,
  AgentResponse,
  ModelConfig,
  ModelDefinition,
  Tool,
  ToolCall,
} from './agent.types.js';

describe('Agent Types', () => {
  test('AgentConfig interface with string model', () => {
    const config: AgentConfig = {
      name: 'test-agent',
      model: 'gpt-4',
      instructions: 'You are a helpful assistant',
    };

    expect(config.name).toBe('test-agent');
    expect(config.model).toBe('gpt-4');
  });

  test('AgentConfig interface with ModelDefinition', () => {
    const modelDef: ModelDefinition = {
      name: 'gpt-4',
      config: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    };

    const config: AgentConfig = {
      name: 'test-agent',
      model: modelDef,
      instructions: 'You are a helpful assistant',
    };

    expect(config.name).toBe('test-agent');
    expect(typeof config.model === 'object' && config.model.name).toBe('gpt-4');
  });

  test('ModelConfig interface is properly structured', () => {
    const modelConfig: ModelConfig = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      timeout: 30000,
    };

    expect(modelConfig.temperature).toBe(0.7);
    expect(modelConfig.timeout).toBe(30000);
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

  test('Tool interface with generic types', () => {
    type TestParams = { query: string };
    type TestResult = { success: boolean };

    const tool: Tool<TestParams, TestResult> = {
      name: 'typed-tool',
      description: 'A typed tool',
      schema: { type: 'object' },
      execute: async (_params: TestParams): Promise<TestResult> => ({
        success: true,
      }),
    };

    expect(tool.name).toBe('typed-tool');
  });

  test('AgentResponse interface is properly structured', () => {
    const response: AgentResponse = {
      content: 'Hello, how can I help?',
      metadata: { tokens: 10 },
    };

    expect(response.content).toBeDefined();
  });

  test('AgentResponse with tool calls', () => {
    const toolCall: ToolCall = {
      name: 'search',
      params: { query: 'test' },
      result: { items: [] },
    };

    const response: AgentResponse = {
      content: 'Here are the results',
      toolCalls: [toolCall],
      data: { processed: true },
    };

    expect(response.toolCalls).toHaveLength(1);
    expect(response.toolCalls?.[0].name).toBe('search');
  });
});
