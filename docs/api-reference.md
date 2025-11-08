# API Reference

Complete API documentation for AgentKit.

## Table of Contents

- [Installation](#installation)
- [Core Functions](#core-functions)
  - [agent()](#agent)
  - [tool()](#tool)
- [Types & Interfaces](#types--interfaces)
  - [Agent](#agent-interface)
  - [AgentConfig](#agentconfig)
  - [AgentResponse](#agentresponse)
  - [Tool](#tool-interface)
  - [ModelConfig](#modelconfig)
- [Error Classes](#error-classes)
- [Examples](#examples)

## Installation

```bash
npm install @agentage/sdk
```

## Core Functions

### agent()

Creates an AI agent that can process messages and execute tools.

#### Signature

```typescript
function agent(name: string): Agent
function agent(config: AgentConfig): Agent
```

#### Parameters

**Pattern 1: Builder (name string)**
- `name` (string): Name identifier for the agent

**Pattern 2: Config (object)**
- `config` (AgentConfig): Complete agent configuration object

#### Returns

`Agent` - An agent instance with builder methods

#### Examples

**Builder Pattern**
```typescript
import { agent } from '@agentage/sdk';

const assistant = agent('my-assistant')
  .model('gpt-4')
  .instructions('You are helpful');

const response = await assistant.send('Hello');
```

**Config Pattern**
```typescript
const assistant = agent({
  name: 'my-assistant',
  model: 'gpt-4',
  instructions: 'You are helpful'
});

const response = await assistant.send('Hello');
```

---

### tool()

Creates a tool that agents can execute with type-safe input validation.

#### Signature

```typescript
function tool<TSchema, TResult>(
  config: CreateToolConfig<TSchema>,
  execute: ToolExecuteFunction<TSchema, TResult>
): Tool<InferSchemaType<TSchema>, TResult>
```

#### Parameters

- `config` (CreateToolConfig): Tool configuration
  - `name` (string): Unique tool identifier
  - `description` (string): What the tool does
  - `inputSchema` (TSchema): Zod schema object defining inputs
  - `title` (string, optional): Display name
- `execute` (ToolExecuteFunction): Async function that executes the tool
  - Receives validated params matching schema
  - Returns Promise with result

#### Returns

`Tool` - A tool instance that can be used by agents

#### Examples

**Simple Tool**
```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const calculator = tool(
  {
    name: 'calculator',
    description: 'Perform basic math operations',
    inputSchema: {
      operation: z.enum(['add', 'subtract']),
      a: z.number(),
      b: z.number()
    }
  },
  async ({ operation, a, b }) => {
    if (operation === 'add') return a + b;
    return a - b;
  }
);
```

**Tool with Optional Parameters**
```typescript
const searchTool = tool(
  {
    name: 'search',
    description: 'Search for information',
    inputSchema: {
      query: z.string(),
      limit: z.number().optional(),
      type: z.enum(['web', 'images']).optional()
    }
  },
  async ({ query, limit = 10, type = 'web' }) => {
    // Search implementation
    return results;
  }
);
```

**Tool with Error Handling**
```typescript
import { readFile } from 'fs/promises';

const fileReader = tool(
  {
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      path: z.string()
    }
  },
  async ({ path }) => {
    try {
      return await readFile(path, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read ${path}: ${error.message}`);
    }
  }
);
```

---

## Types & Interfaces

### Agent Interface

The `Agent` interface provides methods for configuring and using agents.

```typescript
interface Agent {
  model(modelName: string, config?: ModelConfig): Agent;
  instructions(text: string): Agent;
  tools<TParams, TResult>(toolList: Tool<TParams, TResult>[]): Agent;
  config(configEntries: ConfigEntry[]): Agent;
  send(message: string): Promise<AgentResponse>;
  stream(message: string): AsyncIterableIterator<AgentResponse>;
}
```

#### Methods

##### `.model(modelName, config?)`

Set the AI model to use.

**Parameters:**
- `modelName` (string): Model identifier (e.g., 'gpt-4', 'gpt-3.5-turbo')
- `config` (ModelConfig, optional): Model configuration options

**Returns:** Agent (for chaining)

**Example:**
```typescript
agent('assistant')
  .model('gpt-4', {
    temperature: 0.7,
    maxTokens: 1000
  });
```

##### `.instructions(text)`

Set the system instructions for the agent.

**Parameters:**
- `text` (string): Instructions defining agent behavior

**Returns:** Agent (for chaining)

**Example:**
```typescript
agent('assistant')
  .instructions('You are a helpful coding assistant. Provide clear examples.');
```

##### `.tools(toolList)`

Provide tools the agent can execute.

**Parameters:**
- `toolList` (Tool[]): Array of tool instances

**Returns:** Agent (for chaining)

**Example:**
```typescript
agent('assistant')
  .tools([searchTool, calculatorTool, fileReaderTool]);
```

##### `.config(configEntries)`

Set configuration key-value pairs.

**Parameters:**
- `configEntries` (ConfigEntry[]): Array of config objects
  - `key` (string): Config key
  - `value` (string): Config value

**Returns:** Agent (for chaining)

**Example:**
```typescript
agent('assistant')
  .config([
    { key: 'OPENAI_API_KEY', value: 'sk-...' }
  ]);
```

##### `.send(message)`

Send a message to the agent and get a response.

**Parameters:**
- `message` (string): User message to process

**Returns:** Promise<AgentResponse>

**Example:**
```typescript
const response = await agent('assistant')
  .model('gpt-4')
  .send('What is TypeScript?');

console.log(response.content);
```

##### `.stream(message)`

Send a message and receive streaming responses (not yet implemented).

**Parameters:**
- `message` (string): User message to process

**Returns:** AsyncIterableIterator<AgentResponse>

**Status:** Coming in future release

---

### AgentConfig

Configuration object for creating agents.

```typescript
interface AgentConfig {
  name: string;
  model: string | ModelDefinition;
  instructions?: string;
  tools?: Tool<unknown, unknown>[];
}
```

#### Properties

- `name` (string): Agent identifier
- `model` (string | ModelDefinition): Model name or full model definition
  - String: `'gpt-4'`
  - Object: `{ name: 'gpt-4', config: { temperature: 0.7 } }`
- `instructions` (string, optional): System instructions
- `tools` (Tool[], optional): Available tools

#### Example

```typescript
const config: AgentConfig = {
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: {
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  instructions: 'You are helpful',
  tools: [searchTool]
};

const myAgent = agent(config);
```

---

### AgentResponse

Response from agent execution.

```typescript
interface AgentResponse<T = unknown> {
  content: string;
  metadata?: Record<string, unknown>;
  data?: T;
  toolCalls?: ToolCall[];
}
```

#### Properties

- `content` (string): The agent's text response
- `metadata` (Record<string, unknown>, optional): Additional metadata
  - `id`: Response ID
  - `model`: Model used
  - `usage`: Token usage statistics
  - `finishReason`: Why the response ended
- `data` (T, optional): Structured data (if any)
- `toolCalls` (ToolCall[], optional): Tools that were executed

#### Example

```typescript
const response = await agent.send('Hello');

console.log(response.content);        // "Hello! How can I help you?"
console.log(response.metadata?.usage); // { prompt_tokens: 10, ... }
```

---

### Tool Interface

Tool definition with type safety.

```typescript
interface Tool<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}
```

#### Properties

- `name` (string): Unique tool identifier
- `description` (string): What the tool does
- `schema` (ToolSchema): Input validation schema
- `execute` (function): Async function that runs the tool

---

### ModelConfig

Configuration options for AI models.

```typescript
interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

#### Properties

- `temperature` (number, 0.0-1.0): Randomness in responses
  - `0.0`: Deterministic, focused
  - `0.7`: Balanced (default)
  - `1.0`: Creative, varied
- `maxTokens` (number): Maximum tokens in response
- `topP` (number, 0.0-1.0): Nucleus sampling threshold
- `frequencyPenalty` (number, -2.0-2.0): Reduce repetition
- `presencePenalty` (number, -2.0-2.0): Encourage new topics

#### Example

```typescript
const config: ModelConfig = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.2
};

agent('assistant').model('gpt-4', config);
```

---

### ModelDefinition

Full model specification.

```typescript
interface ModelDefinition {
  name: string;
  config?: ModelConfig;
}
```

#### Properties

- `name` (string): Model identifier
- `config` (ModelConfig, optional): Model parameters

#### Example

```typescript
const modelDef: ModelDefinition = {
  name: 'gpt-4',
  config: {
    temperature: 0.7
  }
};
```

---

### CreateToolConfig

Configuration for creating tools.

```typescript
interface CreateToolConfig<TSchema = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema: TSchema;
}
```

#### Properties

- `name` (string): Unique identifier
- `title` (string, optional): Display name
- `description` (string): Tool purpose and usage
- `inputSchema` (TSchema): Zod schema object

---

### ToolExecuteFunction

Function type for tool execution.

```typescript
type ToolExecuteFunction<TSchema, TResult> = (
  params: InferSchemaType<TSchema>
) => Promise<TResult>
```

#### Parameters

- `params`: Validated input matching schema

#### Returns

Promise with tool result

---

## Error Classes

### MissingApiKeyError

Thrown when OpenAI API key is not configured.

```typescript
class MissingApiKeyError extends Error {
  code: 'MISSING_API_KEY';
}
```

**Solution**: Set `OPENAI_API_KEY` environment variable or use `.config()`.

---

### UnsupportedModelError

Thrown when using an unsupported model.

```typescript
class UnsupportedModelError extends Error {
  code: 'UNSUPPORTED_MODEL';
}
```

**Solution**: Use supported models (gpt-4, gpt-3.5-turbo).

---

### ToolNotFoundError

Thrown when agent tries to execute a tool that doesn't exist.

```typescript
class ToolNotFoundError extends Error {
  code: 'TOOL_NOT_FOUND';
}
```

---

### NotImplementedError

Thrown when using features not yet implemented.

```typescript
class NotImplementedError extends Error {
  code: 'NOT_IMPLEMENTED';
}
```

---

## Examples

### Basic Agent

```typescript
import { agent } from '@agentage/sdk';

const assistant = agent('assistant')
  .model('gpt-4')
  .instructions('Be helpful and concise');

const response = await assistant.send('What is Node.js?');
console.log(response.content);
```

### Agent with Tools

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';

const weatherTool = tool(
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    inputSchema: {
      location: z.string(),
      units: z.enum(['celsius', 'fahrenheit']).optional()
    }
  },
  async ({ location, units = 'celsius' }) => {
    // Fetch weather data
    return { temp: 22, units, location };
  }
);

const assistant = agent('weather-bot')
  .model('gpt-4')
  .instructions('Help users with weather information')
  .tools([weatherTool]);

const response = await assistant.send('What is the weather in London?');
console.log(response.content);
```

### Custom Model Configuration

```typescript
const creative = agent('writer')
  .model('gpt-4', {
    temperature: 0.9,
    maxTokens: 2000,
    topP: 1.0,
    presencePenalty: 0.6
  })
  .instructions('Write creative content');

const factual = agent('researcher')
  .model('gpt-4', {
    temperature: 0.1,
    maxTokens: 1000,
    frequencyPenalty: 0.5
  })
  .instructions('Provide factual information');
```

### Error Handling

```typescript
import { MissingApiKeyError, UnsupportedModelError } from '@agentage/sdk';

try {
  const response = await agent('test')
    .model('gpt-4')
    .send('Hello');
  
  console.log(response.content);
} catch (error) {
  if (error instanceof MissingApiKeyError) {
    console.error('API key not configured');
  } else if (error instanceof UnsupportedModelError) {
    console.error('Unsupported model:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Config Pattern

```typescript
import { agent } from '@agentage/sdk';
import type { AgentConfig } from '@agentage/sdk';

const config: AgentConfig = {
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: {
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  instructions: 'You are a helpful assistant',
  tools: [searchTool, calculatorTool]
};

const myAgent = agent(config);
const response = await myAgent.send('Help me');
```

### Multiple Tools

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';
import { readFile, writeFile } from 'fs/promises';

const read = tool(
  {
    name: 'read_file',
    description: 'Read file contents',
    inputSchema: { path: z.string() }
  },
  async ({ path }) => await readFile(path, 'utf-8')
);

const write = tool(
  {
    name: 'write_file',
    description: 'Write file contents',
    inputSchema: {
      path: z.string(),
      content: z.string()
    }
  },
  async ({ path, content }) => {
    await writeFile(path, content, 'utf-8');
    return 'Success';
  }
);

const fileAgent = agent('file-manager')
  .model('gpt-4')
  .instructions('Help manage files')
  .tools([read, write]);

await fileAgent.send('Read package.json and create a summary');
```

---

## Type Inference

AgentKit provides full TypeScript type inference:

```typescript
import { z } from 'zod';

// Schema defines the types
const myTool = tool(
  {
    name: 'example',
    description: 'Example tool',
    inputSchema: {
      name: z.string(),
      age: z.number(),
      active: z.boolean().optional()
    }
  },
  // Parameters are automatically typed!
  async ({ name, age, active }) => {
    // name: string
    // age: number
    // active: boolean | undefined
    return { name, age, active };
  }
);
```

---

## Version

```typescript
import { version } from '@agentage/sdk';
console.log(version); // "0.1.2"
```

---

## See Also

- [Getting Started Guide](./getting-started.md)
- [Tool Development Guide](./tool-development.md)
- [Advanced Usage](./advanced-usage.md)
- [GitHub Repository](https://github.com/agentage/agentkit)
