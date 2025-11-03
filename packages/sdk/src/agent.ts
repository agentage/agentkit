import type {
  Agent,
  AgentConfig,
  AgentResponse,
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

    const messages: ChatCompletionMessageParam[] = [];

    if (this._instructions) {
      messages.push({ role: 'system', content: this._instructions });
    }

    messages.push({ role: 'user', content: message });

    // Convert tools to OpenAI format
    const tools = this._tools?.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema,
      },
    }));

    let response = await openai.chat.completions.create({
      model: modelName,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
      temperature: this._modelConfig?.temperature,
      max_tokens: this._modelConfig?.maxTokens,
      top_p: this._modelConfig?.topP,
    });

    let choice = response.choices[0];

    // Handle tool calls
    while (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      // Add assistant message with tool_calls
      messages.push({
        role: 'assistant',
        content: choice.message.content,
        tool_calls: choice.message.tool_calls,
      });

      // Execute each tool call and add tool messages
      for (const toolCall of choice.message.tool_calls) {
        const tool = this._tools?.find(
          (t) => t.name === toolCall.function.name
        );
        if (!tool) {
          throw new Error(`Tool ${toolCall.function.name} not found`);
        }

        // Parse arguments and execute tool
        const args = JSON.parse(toolCall.function.arguments);
        const toolMessages = await tool.execute(args);

        // Add tool result messages
        for (const toolMessage of toolMessages) {
          messages.push({
            role: 'tool',
            content: toolMessage.content || '',
            tool_call_id: toolCall.id,
          });
        }
      }

      // Continue conversation with tool results
      response = await openai.chat.completions.create({
        model: modelName,
        messages,
        tools: tools && tools.length > 0 ? tools : undefined,
        temperature: this._modelConfig?.temperature,
        max_tokens: this._modelConfig?.maxTokens,
        top_p: this._modelConfig?.topP,
      });

      choice = response.choices[0];
    }

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
