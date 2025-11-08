# AgentKit

[![npm version](https://img.shields.io/npm/v/@agentage/sdk.svg)](https://www.npmjs.com/package/@agentage/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/agentage/agentkit/actions/workflows/ci.yml/badge.svg)](https://github.com/agentage/agentkit/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/agentage/agentkit/branch/master/graph/badge.svg)](https://codecov.io/gh/agentage/agentkit)



## Table of contents
- [AgentKit](#agentkit)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [More Examples](#more-examples)
  - [Philosophy](#philosophy)
  - [API Reference](#api-reference)
    - [Core API Patterns](#core-api-patterns)
      - [Pattern 1: Builder (Express-like)](#pattern-1-builder-express-like)
      - [Pattern 2: Config Object](#pattern-2-config-object)
    - [Defining Tools](#defining-tools)
  - [Troubleshooting](#troubleshooting)
  - [FAQ](#faq)
  - [Contributing](#contributing)
    - [Running Tests](#running-tests)
  - [License](#license)

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/). Node.js 20 or higher is required.

Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install @agentage/sdk
```

## Features

- **Functional API** - Fast and reliable - with no state management
- **Builder pattern** - Builder chainable API
- **Type-safe tools** - Zod-based schema validation
- **Multiple models** - Support for OpenAI, Anthropic, and custom adapters
- **Zero configuration** - Start building agents immediately

## Quick Start

```typescript
import { agent } from '@agentage/sdk';

const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are a helpful assistant')
  .tools([searchTool, calculatorTool]);

const result = await assistant.send('Help me with this task');
console.log(result.content);
```

## More Examples

### 1. Simple Q&A Agent

```typescript
import { agent } from '@agentage/sdk';

const qa = agent('qa-bot')
  .model('gpt-4')
  .instructions('Answer questions concisely and accurately');

const answer = await qa.send('What is TypeScript?');
console.log(answer.content);
```

### 2. Code Reviewer

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';
import { readFile } from 'fs/promises';

const readFileTool = tool(
  {
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      path: z.string().describe('File path to read')
    }
  },
  async ({ path }) => {
    return await readFile(path, 'utf-8');
  }
);

const reviewer = agent('code-reviewer')
  .model('gpt-4')
  .instructions('Review code for bugs, security issues, and best practices')
  .tools([readFileTool]);

const review = await reviewer.send('Review src/index.ts');
console.log(review.content);
```

### 3. Data Analyzer

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';

const fetchDataTool = tool(
  {
    name: 'fetch_data',
    description: 'Fetch data from API',
    inputSchema: {
      endpoint: z.string(),
      params: z.record(z.string()).optional()
    }
  },
  async ({ endpoint, params }) => {
    const url = new URL(endpoint);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString());
    return response.json();
  }
);

const calculateStatsTool = tool(
  {
    name: 'calculate_stats',
    description: 'Calculate statistics on numeric data',
    inputSchema: {
      data: z.array(z.number()),
      metrics: z.array(z.enum(['mean', 'median', 'sum', 'min', 'max']))
    }
  },
  async ({ data, metrics }) => {
    const stats: Record<string, number> = {};
    if (metrics.includes('mean')) {
      stats.mean = data.reduce((a, b) => a + b, 0) / data.length;
    }
    if (metrics.includes('sum')) {
      stats.sum = data.reduce((a, b) => a + b, 0);
    }
    if (metrics.includes('min')) {
      stats.min = Math.min(...data);
    }
    if (metrics.includes('max')) {
      stats.max = Math.max(...data);
    }
    return stats;
  }
);

const analyzer = agent('data-analyzer')
  .model('gpt-4')
  .instructions('Analyze data and provide insights')
  .tools([fetchDataTool, calculateStatsTool]);

const result = await analyzer.send('Analyze sales data for Q4 2024');
console.log(result.content);
```

### 4. Multi-step Workflow

```typescript
const workflow = agent('workflow')
  .model('gpt-4')
  .instructions('Execute multi-step tasks systematically')
  .tools([searchWebTool, readFileTool, writeFileTool, sendEmailTool]);

await workflow.send('Research AI trends, create summary, and email to team');
```

### 5. Custom Model Configuration

```typescript
// More creative (higher temperature)
const creative = agent('writer')
  .model('gpt-4', {
    temperature: 0.9,
    max_tokens: 2000,
    top_p: 1.0
  })
  .instructions('Write creative and engaging content');

// More deterministic (lower temperature)
const analyst = agent('analyst')
  .model('gpt-4', {
    temperature: 0.1,
    max_tokens: 1000
  })
  .instructions('Provide precise, factual analysis');
```

## Philosophy

The AgentKit philosophy is to provide small, functional tooling for building AI agents, making it a great solution for chatbots, automation, data processing, or AI-powered applications.

AgentKit does not force you to use any specific model or tool. With support for multiple model providers and custom adapters, you can quickly craft your perfect AI workflow.

## API Reference

### Core API Patterns

#### Pattern 1: Builder (Express-like)

```typescript
const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are a helpful assistant')
  .tools([searchTool, calculatorTool]);

await assistant.send('Help me with this');
```

#### Pattern 2: Config Object

```typescript
const assistant = agent({
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: {
      temperature: 0.7
    }
  },
  instructions: 'You are a helpful assistant',
  tools: [searchTool, calculatorTool]
});

await assistant.send('Help me with this');
```

Both patterns produce the same result - choose based on preference.

### Defining Tools

```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const githubTool = tool(
  {
    name: 'github',
    title: 'GitHub Tool',
    description: 'Access GitHub repositories',
    inputSchema: {
      repo: z.string(),
      action: z.enum(['get', 'list', 'search'])
    }
  },
  async ({ repo, action }) => {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    return response.json();
  }
);

const databaseTool = tool(
  {
    name: 'database',
    title: 'Database Tool',
    description: 'Query database',
    inputSchema: {
      query: z.string(),
      limit: z.number().optional() 
    }
  },
  async ({ query, limit = 10 }) => {
    return await db.execute(query, { limit });
  }
);
```

## Troubleshooting

### Common Issues

#### Error: "OpenAI API key not found"

**Solution**: Set your API key in environment variables

```bash
export OPENAI_API_KEY='sk-...'
```

Or use a `.env` file:

```env
OPENAI_API_KEY=sk-your-key-here
```

```typescript
import 'dotenv/config';
import { agent } from '@agentage/sdk';
```

#### Error: "Tool execution failed"

**Causes**:
- Invalid tool schema
- Missing required parameters
- Tool handler threw exception

**Solution**: Check tool definition and handler implementation

```typescript
// ✅ Correct
const myTool = tool(
  {
    name: 'my_tool',
    description: 'Clear description of what the tool does',
    inputSchema: {
      param: z.string()  // Explicit schema
    }
  },
  async (input) => {
    // Handle errors gracefully
    try {
      return await doSomething(input.param);
    } catch (error) {
      throw new Error(`Tool failed: ${error.message}`);
    }
  }
);
```

#### Error: "Agent not responding"

**Causes**:
- Model name incorrect
- API quota exceeded
- Network issues
- Invalid API key

**Solution**: Check model name and API status

```typescript
// ✅ Correct model names
.model('gpt-4')
.model('gpt-3.5-turbo')

// ❌ Incorrect
.model('gpt4')  // Missing hyphen
.model('GPT-4')  // Wrong case
```

#### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Type Errors

Make sure you have the correct TypeScript version:

```bash
npm install -D typescript@^5.3.0
```

### Getting Help

- **Documentation**: [docs/](./docs/)
- **GitHub Issues**: [Report bugs](https://github.com/agentage/agentkit/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/agentage/agentkit/discussions)
- **API Reference**: [docs/api-reference.md](./docs/api-reference.md)

## FAQ

### Can I use models other than OpenAI?

Yes! AgentKit supports multiple model providers:
- **OpenAI** (built-in via `@agentage/model-openai`)
- **Anthropic** (coming soon)
- **Custom adapters** (implement `ModelProvider` interface from `@agentage/core`)

### How do I create custom tools?

Use the `tool()` function with Zod schemas:

```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const myTool = tool(
  {
    name: 'my_tool',
    description: 'What the tool does',
    inputSchema: {
      param1: z.string().describe('Description of param1'),
      param2: z.number().optional().describe('Optional parameter')
    }
  },
  async (input) => {
    // Your logic here
    return result;
  }
);
```

See [docs/tool-development.md](./docs/tool-development.md) for more details.

### Can I use this in production?

Yes, but be aware of:
- **API costs**: AI model calls can add up quickly
- **Rate limiting**: Monitor your API usage
- **Error handling**: Implement robust error handling
- **Monitoring**: Track usage and costs
- **Security**: Never expose API keys in client-side code

### How do I contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete guidelines.

### What's the difference between builder and config patterns?

Both patterns work identically - choose based on your preference:

```typescript
// Builder pattern (chainable)
const a1 = agent('name')
  .model('gpt-4')
  .instructions('...');

// Config pattern (object)
const a2 = agent({
  name: 'name',
  model: { name: 'gpt-4' },
  instructions: '...'
});
```

### How do I handle streaming responses?

Streaming is not currently supported in v0.1.x. This feature is planned for a future release.

### Can I save agent state?

Agent execution is stateless by design. For persistence:
- Save agent definitions in YAML files (use CLI)
- Store conversation history separately
- Implement custom state management as needed

### What Node.js version do I need?

Node.js 20.0.0 or higher is required.

### How do I test my agents?

Write unit tests using Jest or your preferred testing framework:

```typescript
import { describe, it, expect } from '@jest/globals';
import { agent } from '@agentage/sdk';

describe('my agent', () => {
  it('should respond correctly', async () => {
    const myAgent = agent('test')
      .model('gpt-4')
      .instructions('Be helpful');
    
    const result = await myAgent.send('Hello');
    expect(result.content).toBeDefined();
  });
});
```

## Contributing

The AgentKit project welcomes all constructive contributions.

### Running Tests

To run the test suite, first install the dependencies:

```bash
npm install
```

Then run `npm test`:

```bash
npm test
```

## License

[MIT](https://github.com/agentage/agentkit/blob/master/LICENSE)

---

**Simple. Functional. Powerful.**

Built with ❤️ by the Agentage team
