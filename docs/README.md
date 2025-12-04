# AgentKit Documentation

Welcome to the AgentKit documentation! This guide will help you build powerful AI agents with minimal code.

## 📚 Documentation

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Build your first agent in 5 minutes
- **[Installation & Setup](./getting-started.md#installation)** - Prerequisites and installation

### Core Documentation
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Tool Development](./tool-development.md)** - Creating custom tools
- **[Advanced Usage](./advanced-usage.md)** - Advanced patterns and techniques

### Migration & Updates
- **[Migration Guide](./migration.md)** - Upgrading between versions
- **[Changelog](../CHANGELOG.md)** - Version history and changes

## 🚀 Quick Links

### Installation

```bash
# SDK
npm install @agentage/sdk
```

### Quick Start

```typescript
import { agent } from '@agentage/sdk';

const assistant = agent('assistant')
  .model('gpt-4')
  .instructions('You are a helpful assistant');

const result = await assistant.send('Hello!');
console.log(result.content);
```

## 💡 Core Concepts

### Agents

Agents are AI-powered assistants configured with:
- **Model**: The LLM to use (e.g., `gpt-4`, `gpt-3.5-turbo`)
- **Instructions**: System prompt defining behavior
- **Tools**: Functions the agent can call
- **Configuration**: Model parameters (temperature, max_tokens, etc.)

### Tools

Tools extend agent capabilities by providing callable functions:
- Defined with Zod schemas for type safety
- Input validation built-in
- Async execution support
- Error handling

Example:
```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const searchTool = tool(
  {
    name: 'search',
    description: 'Search the web',
    inputSchema: {
      query: z.string()
    }
  },
  async ({ query }) => {
    // Your search logic
    return results;
  }
);
```

### Models

Model providers connect to AI services:
- **OpenAI** (built-in via `@agentage/model-openai`)
- **Anthropic** (coming soon)
- **Custom adapters** (implement `ModelProvider` interface)

### Messages

Messages represent communication with agents:
- User messages (from you)
- Assistant messages (from the agent)
- Tool messages (tool execution results)
- System messages (instructions)

## 📖 Guides by Topic

### For Beginners
1. [Getting Started](./getting-started.md) - Your first agent
2. [Basic Examples](./getting-started.md#examples) - Simple use cases
3. [Tool Development](./tool-development.md) - Creating tools

### For Advanced Users
1. [Advanced Usage](./advanced-usage.md) - Complex patterns
2. [Error Handling](./advanced-usage.md#error-handling) - Robust error handling
3. [Performance](./advanced-usage.md#performance) - Optimization tips
4. [API Reference](./api-reference.md) - Complete API details

## 🔧 Resources

### Code Examples
- [Examples Directory](../examples/) - Working code examples
- [Basic SDK Example](../examples/agent-sdk-basic-example/) - Simple agent
- [Tool Example](../examples/agent-sdk-basic-tool-example/) - Agent with tools

### External Resources
- [GitHub Repository](https://github.com/agentage/agentkit)
- [npm Packages](https://www.npmjs.com/package/@agentage/sdk)
- [Issue Tracker](https://github.com/agentage/agentkit/issues)
- [Discussions](https://github.com/agentage/agentkit/discussions)

### Contributing
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Code Standards](../CONTRIBUTING.md#code-standards) - Coding guidelines
- [Development Setup](../CONTRIBUTING.md#development-setup) - Local setup

## 🆘 Getting Help

### Common Issues
See the [Troubleshooting Guide](../README.md#troubleshooting) for solutions to common problems.

### Support Channels
- **Bug Reports**: [GitHub Issues](https://github.com/agentage/agentkit/issues)
- **Questions**: [GitHub Discussions](https://github.com/agentage/agentkit/discussions)
- **Security**: security@agentage.dev

## 📦 Packages

AgentKit is organized as a monorepo with multiple packages:

| Package | Description | npm |
|---------|-------------|-----|
| `@agentage/sdk` | Main SDK for building agents | [![npm](https://img.shields.io/npm/v/@agentage/sdk.svg)](https://www.npmjs.com/package/@agentage/sdk) |
| `@agentage/core` | Core types and interfaces | [![npm](https://img.shields.io/npm/v/@agentage/core.svg)](https://www.npmjs.com/package/@agentage/core) |
| `@agentage/model-openai` | OpenAI model adapter | [![npm](https://img.shields.io/npm/v/@agentage/model-openai.svg)](https://www.npmjs.com/package/@agentage/model-openai) |

## 🗺️ Documentation Structure

```
docs/
├── README.md              # This file
├── getting-started.md     # Beginner's guide
├── api-reference.md       # Complete API docs
├── tool-development.md    # Tool creation guide
├── advanced-usage.md      # Advanced patterns
└── migration.md          # Version migration
```

## 📝 Documentation Standards

Our documentation follows these principles:
- **Clear**: Easy to understand for all skill levels
- **Complete**: Covers all features and APIs
- **Current**: Kept up to date with releases
- **Practical**: Includes working code examples
- **Searchable**: Well-organized and linked

## 🔄 Keep Learning

1. **Start Here**: [Getting Started Guide](./getting-started.md)
2. **Build Tools**: [Tool Development Guide](./tool-development.md)
3. **Go Deeper**: [Advanced Usage](./advanced-usage.md)
4. **Reference**: [API Documentation](./api-reference.md)

---

**Questions?** Open a [discussion](https://github.com/agentage/agentkit/discussions) or check the [FAQ](../README.md#faq).
