import type { Agent, AgentConfig, AgentResponse } from './agent.types';
import type { ModelConfig, ModelDefinition } from './model.types';

describe('Agent Types', () => {
  describe('AgentConfig', () => {
    it('should allow valid config with string model', () => {
      const config: AgentConfig = {
        name: 'test-agent',
        model: 'gpt-4',
      };
      expect(config.name).toBe('test-agent');
      expect(config.model).toBe('gpt-4');
    });

    it('should allow valid config with ModelDefinition', () => {
      const modelDef: ModelDefinition = {
        name: 'gpt-4',
        config: { temperature: 0.7 },
      };
      const config: AgentConfig = {
        name: 'test-agent',
        model: modelDef,
      };
      expect(config.model).toEqual(modelDef);
    });

    it('should allow optional fields', () => {
      const config: AgentConfig = {
        name: 'test-agent',
        model: 'gpt-4',
        instructions: 'You are helpful',
        tools: [],
      };
      expect(config.instructions).toBe('You are helpful');
      expect(config.tools).toEqual([]);
    });
  });

  describe('AgentResponse', () => {
    it('should allow basic response', () => {
      const response: AgentResponse = {
        content: 'Hello',
      };
      expect(response.content).toBe('Hello');
    });

    it('should allow response with metadata', () => {
      const response: AgentResponse = {
        content: 'Hello',
        metadata: { tokens: 10 },
        data: { result: 42 },
      };
      expect(response.metadata).toEqual({ tokens: 10 });
      expect(response.data).toEqual({ result: 42 });
    });

    it('should allow response with tool calls', () => {
      const response: AgentResponse = {
        content: 'Called tool',
        toolCalls: [
          {
            name: 'search',
            params: { query: 'test' },
            result: 'found',
          },
        ],
      };
      expect(response.toolCalls).toHaveLength(1);
    });
  });

  describe('Agent Interface', () => {
    it('should define builder pattern methods', () => {
      const mockAgent: Agent = {
        model: () => mockAgent,
        instructions: () => mockAgent,
        tools: () => mockAgent,
        config: () => mockAgent,
        send: async () => ({ content: '' }),
        stream: async function* () {
          yield { content: '' };
        },
      };

      expect(mockAgent.model).toBeDefined();
      expect(mockAgent.instructions).toBeDefined();
      expect(mockAgent.tools).toBeDefined();
      expect(mockAgent.config).toBeDefined();
      expect(mockAgent.send).toBeDefined();
      expect(mockAgent.stream).toBeDefined();
    });
  });

  describe('ModelConfig', () => {
    it('should allow all optional fields', () => {
      const config: ModelConfig = {};
      expect(config).toEqual({});
    });

    it('should allow partial config', () => {
      const config: ModelConfig = {
        temperature: 0.7,
        maxTokens: 100,
      };
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(100);
    });

    it('should allow full config', () => {
      const config: ModelConfig = {
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
        timeout: 5000,
      };
      expect(Object.keys(config)).toHaveLength(4);
    });
  });
});
