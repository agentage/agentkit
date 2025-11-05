# @agentage/core

Core types and interfaces for AgentKit - the simple SDK for building AI agents in Node.js.

## Installation

```bash
npm install @agentage/core
```

## Usage

```typescript
import type { 
  Agent, 
  AgentConfig,
  AgentResponse,
  Tool,
  ModelConfig,
  ModelProvider,
  Model,
  SupportedModel,
  Message,
  Result,
  ConfigEntry,
  RuntimeConfig,
  EnvironmentConfig
} from '@agentage/core';

// Example: Result type usage
const divide = (a: number, b: number): Result<number, string> => {
  if (b === 0) {
    return { ok: false, error: 'Division by zero' };
  }
  return { ok: true, data: a / b };
};

// Example: ModelProvider implementation
const myProvider: ModelProvider = {
  name: 'my-provider',
  getSupportedModels: () => [
    { 
      name: 'my-model', 
      capabilities: { streaming: true, functionCalling: true } 
    }
  ],
  getModel: (name, config) => ({
    name,
    send: async (request) => ({ content: 'response' })
  }),
  supportsModel: (name) => name === 'my-model'
};
```

## Included Types

### Agent Types
- `Agent` - Agent interface with builder pattern
- `AgentConfig` - Agent configuration object
- `AgentResponse` - Agent execution response

### Message Types
- `Message` - Union of all message types
- `SystemMessage` - System instructions
- `UserMessage` - User input
- `AssistantMessage` - Assistant response
- `ToolMessage` - Tool execution result

### Tool Types
- `Tool<TParams, TResult>` - Tool definition with type inference
- `ToolSchema<T>` - Schema validator (Zod-compatible)
- `InferSchemaType<TSchema>` - Automatic type inference from schema

### Model Types
- `ModelConfig` - Model configuration options
- `ModelDefinition` - Model with configuration
- `ModelProvider` - Model provider adapter interface
- `Model` - Model interface for send/stream operations
- `SupportedModel` - Model information with capabilities
- `ModelRequest` - Request to model provider
- `ModelResponse` - Response from model provider

### Config Types
- `ConfigEntry` - Configuration entry with key, value, and optional scope
- `RuntimeConfig` - Runtime configuration with entries
- `EnvironmentConfig` - Environment and API configuration

### Result Types
- `Result<T, E>` - Functional error handling union type
- `Success<T>` - Success result with `ok: true` and `data: T`
- `Failure<E>` - Failure result with `ok: false` and `error: E`

### Utility Types
- `InferSchemaType<TSchema>` - Automatic type inference from schema

## Philosophy

- **Type-safe**: Zero `any` types, all explicit
- **Functional**: Composable, immutable types
- **Simple**: Easy to understand and extend
- **Powerful**: Type inference from schemas

## Related Packages

- `@agentage/sdk` - Main SDK implementation
- `@agentage/cli` - CLI tool for managing agents

## License

MIT