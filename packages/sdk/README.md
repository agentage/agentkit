# @agentkit/sdk

AgentKit SDK - Core interface definitions and types for building AI agents.

## Installation

```bash
npm install @agentkit/sdk
```

## Usage

### Pattern 1: Builder (Express-like)

```typescript
import type { Agent } from '@agentkit/sdk';

const assistant: Agent = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are a helpful assistant')
  .tools([searchTool, calculatorTool]);

const result = await assistant.send('Help me with this task');
console.log(result.content);
```

### Pattern 2: Config Object

```typescript
import type { AgentConfig } from '@agentkit/sdk';

const config: AgentConfig = {
  name: 'assistant',
  model: 'gpt-4',
  temperature: 0.7,
  instructions: 'You are a helpful assistant',
  tools: [searchTool, calculatorTool],
};

const assistant = agent(config);
await assistant.send('Help me with this');
```

### Defining Tools

```typescript
import type { Tool, CreateToolConfig } from '@agentkit/sdk';
import { z } from 'zod';

const githubTool: CreateToolConfig = {
  name: 'github',
  description: 'Access GitHub repositories',
  schema: z.object({
    repo: z.string(),
    action: z.enum(['get', 'list', 'search']),
  }),
  execute: async ({ repo, action }) => {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    return response.json();
  },
};
```

## Interfaces

### AgentConfig
Configuration for an agent instance with model, instructions, temperature, and tools.

### Agent
Core interface with builder pattern methods: `model()`, `instructions()`, `tools()`, `send()`.

### Tool
Tool definition with name, description, schema, and execute function.

### AgentResponse
Response structure from agent with content and optional metadata.

### ModelConfig
Model configuration options including temperature, maxTokens, and topP.

### CreateToolConfig
Tool creation configuration type for type-safe tool definitions.

### AgentFactory
Factory function type supporting both string and config object patterns.

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
