# @agentage/sdk

AgentKit SDK - Core interface definitions and types for building AI agents.

## Installation

```bash
npm install @agentage/sdk
```

## Usage

### Pattern 1: Builder (Express-like)

```typescript
import { agent, tool } from '@agentage/sdk';
import type { Agent, AgentResponse } from '@agentage/sdk';

const assistant: Agent = agent('assistant')
  .model('gpt-4', { temperature: 0.7, maxTokens: 2000 })
  .instructions('You are a helpful assistant')
  .tools([searchTool, calculatorTool]);

const result: AgentResponse = await assistant.send('Help me with this task');
console.log(result.content);
```

### Pattern 2: Config Object

```typescript
import { agent } from '@agentage/sdk';
import type { AgentConfig, Agent } from '@agentage/sdk';

const config: AgentConfig = {
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: { temperature: 0.7, maxTokens: 2000 }
  },
  instructions: 'You are a helpful assistant',
  tools: [searchTool, calculatorTool],
};

const assistant: Agent = agent(config);
const result = await assistant.send('Help me with this');
```

### Defining Tools

```typescript
import { tool } from '@agentage/sdk';
import type { Tool, CreateToolConfig } from '@agentage/sdk';
import { z } from 'zod';

// Type-safe tool definition
const githubSchema = z.object({
  repo: z.string(),
  action: z.enum(['get', 'list', 'search']),
});

type GithubParams = z.infer<typeof githubSchema>;
type GithubResult = { name: string; stars: number };

const githubTool: Tool<GithubParams, GithubResult> = tool({
  name: 'github',
  description: 'Access GitHub repositories',
  schema: githubSchema,
  execute: async ({ repo, action }) => {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    const data = await response.json();
    return { name: data.name, stars: data.stargazers_count };
  },
});

// Simple tool without explicit types
const databaseTool = tool({
  name: 'database',
  description: 'Query database',
  schema: z.object({
    query: z.string(),
    limit: z.number().optional(),
  }),
  execute: async ({ query, limit = 10 }) => {
    return await db.execute(query, { limit });
  },
});
```

### Streaming Responses

```typescript
const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are a helpful assistant');

for await (const chunk of assistant.stream('Tell me a story')) {
  console.log(chunk.content);
}
```

## Type Definitions

### Core Interfaces

#### `Agent`
Main interface with builder pattern methods:
- `model(modelName: string, config?: ModelConfig): Agent`
- `instructions(text: string): Agent`
- `tools(toolList: Tool[]): Agent`
- `send(message: string): Promise<AgentResponse>`
- `stream(message: string): AsyncIterableIterator<AgentResponse>`

#### `AgentConfig`
Configuration object for creating agents:
```typescript
interface AgentConfig {
  name: string;
  model: string | ModelDefinition;
  instructions?: string;
  tools?: Tool[];
}
```

#### `Tool<TParams, TResult>`
Tool definition with generic type support:
```typescript
interface Tool<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}
```

#### `AgentResponse<T>`
Response from agent operations:
```typescript
interface AgentResponse<T = unknown> {
  content: string;
  metadata?: Record<string, unknown>;
  data?: T;
  toolCalls?: ToolCall[];
}
```

#### `ModelConfig`
Model configuration options:
```typescript
interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
}
```

#### `ModelDefinition`
Model with explicit configuration:
```typescript
interface ModelDefinition {
  name: string;
  config?: ModelConfig;
}
```

### Factory Types

#### `AgentFactory`
Factory function supporting both patterns:
```typescript
type AgentFactory = {
  (name: string): Agent;
  (config: AgentConfig): Agent;
};
```

#### `ToolFactory`
Type-safe tool creation:
```typescript
type ToolFactory = <TParams = unknown, TResult = unknown>(
  config: CreateToolConfig<TParams, TResult>
) => Tool<TParams, TResult>;
```

#### `CreateToolConfig<TParams, TResult>`
Configuration for creating tools:
```typescript
interface CreateToolConfig<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  schema: ToolSchema<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}
```

## Features

✅ **Full TypeScript Support** - Complete type definitions with generics  
✅ **Zod Integration** - Built-in support for Zod schemas  
✅ **Builder Pattern** - Fluent, chainable API  
✅ **Config Object Pattern** - Declarative configuration  
✅ **Type-Safe Tools** - Generic tool definitions with parameter and result typing  
✅ **Streaming Support** - Async iteration for streaming responses  
✅ **Zero Dependencies** - Pure interface definitions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run type-check

# Verify all
npm run verify
```

## License

MIT
