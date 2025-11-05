import { describe, expect, it } from '@jest/globals';
import type {
  Model,
  ModelProvider,
  ModelRequest,
  ModelResponse,
  SupportedModel,
} from './modelprovider.types.js';

describe('ModelProvider Types', () => {
  describe('SupportedModel', () => {
    it('should define supported model with all properties', () => {
      const model: SupportedModel = {
        name: 'gpt-4',
        description: 'GPT-4 model',
        defaultConfig: {
          temperature: 0.7,
          maxTokens: 4096,
        },
        capabilities: {
          streaming: true,
          functionCalling: true,
          vision: true,
        },
      };

      expect(model.name).toBe('gpt-4');
      expect(model.description).toBe('GPT-4 model');
      expect(model.defaultConfig?.temperature).toBe(0.7);
      expect(model.capabilities?.streaming).toBe(true);
    });

    it('should allow minimal supported model', () => {
      const model: SupportedModel = {
        name: 'gpt-3.5-turbo',
      };

      expect(model.name).toBe('gpt-3.5-turbo');
      expect(model.description).toBeUndefined();
    });
  });

  describe('ModelRequest', () => {
    it('should define valid request with all properties', () => {
      const request: ModelRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4',
        config: {
          temperature: 0.7,
          maxTokens: 1000,
        },
        tools: [],
      };

      expect(request.model).toBe('gpt-4');
      expect(request.messages).toHaveLength(1);
      expect(request.config?.temperature).toBe(0.7);
    });

    it('should allow minimal request', () => {
      const request: ModelRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4',
      };

      expect(request.messages).toHaveLength(1);
      expect(request.config).toBeUndefined();
    });
  });

  describe('ModelResponse', () => {
    it('should define valid response with all properties', () => {
      const response: ModelResponse = {
        content: 'Hello! How can I help?',
        toolCalls: [
          {
            name: 'search',
            params: { query: 'test' },
            result: null,
          },
        ],
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
        finishReason: 'stop',
      };

      expect(response.content).toBe('Hello! How can I help?');
      expect(response.usage?.totalTokens).toBe(30);
      expect(response.finishReason).toBe('stop');
    });

    it('should allow minimal response', () => {
      const response: ModelResponse = {
        content: 'Response text',
      };

      expect(response.content).toBe('Response text');
      expect(response.usage).toBeUndefined();
    });
  });

  describe('Model', () => {
    it('should implement model interface', async () => {
      const model: Model = {
        name: 'gpt-4',
        send: async (request: ModelRequest) => ({
          content: `Echo: ${request.messages[0].content}`,
        }),
      };

      const response = await model.send({
        messages: [{ role: 'user', content: 'test' }],
        model: 'gpt-4',
      });

      expect(model.name).toBe('gpt-4');
      expect(response.content).toBe('Echo: test');
    });

    it('should implement model with streaming', async () => {
      const model: Model = {
        name: 'gpt-4',
        send: async () => ({ content: 'final' }),
        stream: async function* () {
          yield { content: 'Hello' };
          yield { content: ' world' };
        },
      };

      if (model.stream) {
        const chunks: string[] = [];
        for await (const chunk of model.stream({
          messages: [{ role: 'user', content: 'test' }],
          model: 'gpt-4',
        })) {
          chunks.push(chunk.content);
        }
        expect(chunks).toEqual(['Hello', ' world']);
      }
    });
  });

  describe('ModelProvider', () => {
    it('should implement provider interface', () => {
      const provider: ModelProvider = {
        name: 'test-provider',
        getSupportedModels: () => [
          { name: 'gpt-4' },
          { name: 'gpt-3.5-turbo' },
        ],
        getModel: (modelName: string) => ({
          name: modelName,
          send: async () => ({ content: 'response' }),
        }),
        supportsModel: (modelName: string) => modelName.startsWith('gpt-'),
      };

      expect(provider.name).toBe('test-provider');
      expect(provider.getSupportedModels()).toHaveLength(2);
      expect(provider.supportsModel('gpt-4')).toBe(true);
      expect(provider.supportsModel('claude-3')).toBe(false);

      const model = provider.getModel('gpt-4');
      expect(model).not.toBeNull();
      expect(model?.name).toBe('gpt-4');
    });

    it('should return null for unsupported model', () => {
      const provider: ModelProvider = {
        name: 'openai',
        getSupportedModels: () => [{ name: 'gpt-4' }],
        getModel: (modelName: string) =>
          modelName === 'gpt-4'
            ? { name: modelName, send: async () => ({ content: 'ok' }) }
            : null,
        supportsModel: (modelName: string) => modelName === 'gpt-4',
      };

      expect(provider.getModel('unsupported-model')).toBeNull();
      expect(provider.supportsModel('unsupported-model')).toBe(false);
    });

    it('should get model with config', () => {
      const provider: ModelProvider = {
        name: 'openai',
        getSupportedModels: () => [
          {
            name: 'gpt-4',
            defaultConfig: { temperature: 0.7 },
          },
        ],
        getModel: (modelName: string, config) => ({
          name: modelName,
          send: async (req) => ({
            content: `Config: ${JSON.stringify(config || req.config)}`,
          }),
        }),
        supportsModel: () => true,
      };

      const model = provider.getModel('gpt-4', { temperature: 0.9 });
      expect(model).not.toBeNull();
    });
  });
});
