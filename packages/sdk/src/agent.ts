import type {
  Agent,
  AgentConfig,
  AgentResponse,
  ModelConfig,
  Tool,
} from '@agentage/core';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  MissingApiKeyError,
  NotImplementedError,
  ToolNotFoundError,
  UnsupportedModelError,
} from './errors.js';

/**
 * OpenAI tool definition
 */
interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any;
  };
}

/**
 * Convert Zod schema object to JSON Schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertSchemaToJsonSchema(schema: any): any {
  // If schema is empty object, return it as-is
  if (Object.keys(schema).length === 0) {
    return schema;
  }

  // Convert each property from Zod to JSON Schema
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(schema)) {
    // Check if it's a Zod schema
    if (value && typeof value === 'object' && '_def' in value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonSchema = zodToJsonSchema(value as any, {
        $refStrategy: 'none',
      });

      // Extract the actual schema (remove top-level $schema if present)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $schema, ...cleanSchema } = jsonSchema as Record<string, unknown>;
      properties[key] = cleanSchema;

      // Check if the field is optional
      const def = (value as { _def?: { typeName?: string } })._def;
      if (def?.typeName !== 'ZodOptional') {
        required.push(key);
      }
    } else {
      // If not a Zod schema, pass through as-is
      properties[key] = value;
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
  };
}

/**
 * Convert agent tool to OpenAI tool format
 */
function convertToOpenAITool<TParams = unknown, TResult = unknown>(
  tool: Tool<TParams, TResult>
): OpenAITool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: convertSchemaToJsonSchema(tool.schema),
    },
  };
}

/**
 * Agent builder implementation
 */
class AgentBuilder implements Agent {
  private _name: string;
  private _modelName?: string;
  private _modelConfig?: ModelConfig;
  private _instructions?: string;
  private _tools?: Tool<unknown, unknown>[];
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

  tools<TParams = unknown, TResult = unknown>(
    toolList: Tool<TParams, TResult>[]
  ): Agent {
    this._tools = toolList as Tool<unknown, unknown>[];
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
      throw new UnsupportedModelError(modelName);
    }

    const apiKey = this._config?.OPENAI_API_KEY;
    if (!apiKey) {
      throw new MissingApiKeyError();
    }

    const openai = new OpenAI({ apiKey });

    const messages: ChatCompletionMessageParam[] = [];

    if (this._instructions) {
      messages.push({ role: 'system', content: this._instructions });
    }

    messages.push({ role: 'user', content: message });

    // Convert tools to OpenAI format
    const tools = this._tools?.map(convertToOpenAITool);

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
        // OpenAI v6 uses union type, we only handle function tool calls
        if (toolCall.type !== 'function') {
          continue;
        }

        const tool = this._tools?.find(
          (t) => t.name === toolCall.function.name
        );
        if (!tool) {
          throw new ToolNotFoundError(toolCall.function.name);
        }

        // Parse arguments and execute tool
        const args = JSON.parse(toolCall.function.arguments);
        const result = await tool.execute(args);

        // Add tool result message
        messages.push({
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        });
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
    throw new NotImplementedError('Agent.stream()');
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

/**
 * Export for testing
 */
export { convertToOpenAITool };
