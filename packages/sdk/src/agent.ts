import type {
  Agent,
  AgentConfig,
  AgentResponse,
  Message,
  ModelConfig,
  Tool,
} from '@agentage/core';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Agent builder implementation
 */
class AgentBuilder implements Agent {
  private _name: string;
  private _modelName?: string;
  private _modelConfig?: ModelConfig;
  private _instructions?: string;
  private _tools?: Tool[];
  private _config?: Record<string, string>;

  constructor(name: string) {
    this._name = name;
  }

  model(modelName: string, config?: ModelConfig): Agent {
    this._modelName = modelName;
    this._modelConfig = config;
    return this;
  }

  instructions(text: string): Agent {
    this._instructions = text;
    return this;
  }

  tools(toolList: Tool[]): Agent {
    this._tools = toolList;
    return this;
  }

  config(configEntries: Array<{ key: string; value: string }>): Agent {
    this._config = configEntries.reduce((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {} as Record<string, string>);
    return this;
  }

  async send(message: string): Promise<AgentResponse> {
    const modelName = this._modelName || 'gpt-4';

    // Only support GPT-4 for now
    if (!modelName.startsWith('gpt-4')) {
      throw new Error(
        `Model ${modelName} not supported. Only gpt-4 models are supported.`
      );
    }

    const apiKey = this._config?.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'API key required. Use .config([{ key: "OPENAI_API_KEY", value: "..." }])'
      );
    }

    const openai = new OpenAI({ apiKey });

    const messages: Message[] = [];

    if (this._instructions) {
      messages.push({ role: 'system', content: this._instructions });
    }

    messages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: messages as unknown as ChatCompletionMessageParam[],
      temperature: this._modelConfig?.temperature,
      max_tokens: this._modelConfig?.maxTokens,
      top_p: this._modelConfig?.topP,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      metadata: {
        id: response.id,
        model: response.model,
        usage: response.usage,
        finishReason: choice.finish_reason,
      },
    };
  }

  async *stream(_message: string): AsyncIterableIterator<AgentResponse> {
    // TODO: Implement streaming
    throw new Error('Agent.stream() not yet implemented. Use a model adapter.');
    yield { content: '' }; // Make TypeScript happy
  }

  getConfig(): AgentConfig {
    return {
      name: this._name,
      model: this._modelConfig
        ? { name: this._modelName || 'gpt-4', config: this._modelConfig }
        : this._modelName || 'gpt-4',
      instructions: this._instructions,
      tools: this._tools,
    };
  }
}

/**
 * Create an agent using builder pattern or config object
 */
export function agent(nameOrConfig: string | AgentConfig): Agent {
  if (typeof nameOrConfig === 'string') {
    return new AgentBuilder(nameOrConfig);
  }

  const builder = new AgentBuilder(nameOrConfig.name);

  if (typeof nameOrConfig.model === 'string') {
    builder.model(nameOrConfig.model);
  } else {
    builder.model(nameOrConfig.model.name, nameOrConfig.model.config);
  }

  if (nameOrConfig.instructions) {
    builder.instructions(nameOrConfig.instructions);
  }

  if (nameOrConfig.tools) {
    builder.tools(nameOrConfig.tools);
  }

  return builder;
}
