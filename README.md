# AgentKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


## Table of contents
- [AgentKit](#agentkit)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Philosophy](#philosophy)
  - [API Reference](#api-reference)
    - [Core API Patterns](#core-api-patterns)
      - [Pattern 1: Builder (Express-like)](#pattern-1-builder-express-like)
      - [Pattern 2: Config Object](#pattern-2-config-object)
    - [Defining Tools](#defining-tools)
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

const githubTool = tool({
  name: 'github',
  description: 'Access GitHub repositories',
  schema: z.object({
    repo: z.string(),
    action: z.enum(['get', 'list', 'search'])
  }),
  execute: async ({ repo, action }) => {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    return response.json();
  }
});

const databaseTool = tool({
  name: 'database',
  description: 'Query database',
  schema: z.object({
    query: z.string(),
    limit: z.number().optional() 
  }),
  execute: async ({ query, limit = 10 }) => {
    return await db.execute(query, { limit });
  }
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