# Getting Started with AgentKit

Build your first AI agent in 5 minutes! This guide walks you through everything you need to get started with AgentKit.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 20.0.0 or higher ([download](https://nodejs.org/))
- **npm**: Version 10.0.0 or higher (comes with Node.js)
- **OpenAI API key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

Check your versions:
```bash
node --version  # Should be v20.0.0 or higher
npm --version   # Should be 10.0.0 or higher
```

## Installation

### SDK Installation

Install the AgentKit SDK in your project:

```bash
npm install @agentage/sdk
```

For environment variable support:
```bash
npm install dotenv
```

### CLI Installation

Install the AgentKit CLI globally:

```bash
npm install -g @agentage/cli
```

Verify installation:
```bash
agent --version
```

## Your First Agent (SDK)

Let's build a simple AI assistant using the SDK.

### Step 1: Create a Project

```bash
mkdir my-first-agent
cd my-first-agent
npm init -y
npm install @agentage/sdk dotenv
```

### Step 2: Set Up Environment

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

**Important**: Add `.env` to your `.gitignore` to avoid committing your API key:
```bash
echo ".env" >> .gitignore
```

### Step 3: Create Your Agent

Create `index.js`:

```javascript
import { agent } from '@agentage/sdk';
import 'dotenv/config';

const assistant = agent('my-assistant')
  .model('gpt-4')
  .instructions('You are a helpful assistant. Be concise and friendly.');

const response = await assistant.send('Hello! What can you help me with?');
console.log(response.content);
```

### Step 4: Run Your Agent

```bash
node index.js
```

You should see a response from your agent! 🎉

### Step 5: Try More Interactions

Update your `index.js` to have a conversation:

```javascript
import { agent } from '@agentage/sdk';
import 'dotenv/config';

const assistant = agent('my-assistant')
  .model('gpt-4')
  .instructions('You are a helpful assistant. Be concise and friendly.');

// First message
const response1 = await assistant.send('What is TypeScript?');
console.log('Agent:', response1.content);

// Follow-up message
const response2 = await assistant.send('How is it different from JavaScript?');
console.log('Agent:', response2.content);
```

## Your First Agent (CLI)

The CLI provides a declarative way to define and run agents using YAML files.

### Step 1: Initialize an Agent

```bash
agent init my-assistant
```

This creates `agents/my-assistant.yml`:

```yaml
name: my-assistant
model: gpt-4
instructions: |
  You are a helpful AI assistant.
  Respond clearly and concisely.
tools: []
variables: {}
```

### Step 2: Customize Your Agent

Edit `agents/my-assistant.yml`:

```yaml
name: my-assistant
model: gpt-4
instructions: |
  You are a coding assistant specializing in JavaScript and TypeScript.
  Provide clear, working code examples with explanations.
  Follow best practices and modern syntax.
tools: []
variables: {}
```

### Step 3: Run Your Agent

```bash
agent run my-assistant "How do I read a file in Node.js?"
```

### Step 4: List Your Agents

```bash
agent list
```

This shows all agents in your `agents/` directory.

## Adding Tools to Your Agent

Tools allow agents to perform actions like reading files, calling APIs, or performing calculations.

### Define a Tool

Create `tools.js`:

```javascript
import { tool } from '@agentage/sdk';
import { z } from 'zod';
import { readFile } from 'fs/promises';

export const fileReaderTool = tool(
  {
    name: 'read_file',
    description: 'Read the contents of a file from the filesystem',
    inputSchema: {
      path: z.string().describe('The file path to read')
    }
  },
  async ({ path }) => {
    try {
      const content = await readFile(path, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
);

export const calculatorTool = tool(
  {
    name: 'calculator',
    description: 'Perform mathematical calculations',
    inputSchema: {
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number().describe('First number'),
      b: z.number().describe('Second number')
    }
  },
  async ({ operation, a, b }) => {
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        return a / b;
    }
  }
);
```

### Use Tools in Your Agent

Create `agent-with-tools.js`:

```javascript
import { agent } from '@agentage/sdk';
import { fileReaderTool, calculatorTool } from './tools.js';
import 'dotenv/config';

const codeReviewer = agent('code-reviewer')
  .model('gpt-4')
  .instructions('You are a code reviewer. Analyze files for issues and improvements.')
  .tools([fileReaderTool, calculatorTool]);

const review = await codeReviewer.send('Review the package.json file');
console.log(review.content);
```

Run it:
```bash
node agent-with-tools.js
```

The agent will use the `read_file` tool to read `package.json` and provide a review!

## Model Configuration

Customize how your agent behaves by adjusting model parameters.

### Temperature Control

Temperature controls randomness (0.0 = deterministic, 1.0 = creative):

```javascript
// More creative responses
const creativeAgent = agent('writer')
  .model('gpt-4', {
    temperature: 0.9
  })
  .instructions('Write creative and engaging content');

// More deterministic responses
const analyzerAgent = agent('analyzer')
  .model('gpt-4', {
    temperature: 0.1
  })
  .instructions('Provide precise, factual analysis');
```

### Token Limits

Control response length with `max_tokens`:

```javascript
const summarizer = agent('summarizer')
  .model('gpt-4', {
    max_tokens: 500,
    temperature: 0.7
  })
  .instructions('Summarize content concisely');
```

### All Configuration Options

```javascript
const agent = agent('configured')
  .model('gpt-4', {
    temperature: 0.7,        // 0.0-1.0: creativity level
    max_tokens: 1000,        // Maximum tokens in response
    top_p: 1.0,             // Nucleus sampling
    frequency_penalty: 0.0,  // Reduce repetition
    presence_penalty: 0.0    // Encourage new topics
  });
```

## Pattern Comparison

AgentKit supports two API patterns - choose the one you prefer!

### Builder Pattern (Chainable)

```javascript
const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are helpful')
  .tools([tool1, tool2]);

await assistant.send('Hello');
```

**Pros**: 
- Fluent, readable
- Easy to build incrementally
- Similar to Express.js

### Config Pattern (Object)

```javascript
const assistant = agent({
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: { temperature: 0.7 }
  },
  instructions: 'You are helpful',
  tools: [tool1, tool2]
});

await assistant.send('Hello');
```

**Pros**:
- All configuration in one place
- Easy to load from JSON/YAML
- Good for serialization

Both patterns produce identical results!

## Project Structure

Here's a recommended project structure:

```
my-agent-project/
├── .env                    # Environment variables (API keys)
├── .gitignore             # Git ignore (.env, node_modules)
├── package.json           # Dependencies
├── index.js               # Main entry point
├── agents/                # Agent definitions (YAML)
│   ├── assistant.yml
│   └── reviewer.yml
├── tools/                 # Tool definitions
│   ├── file-tools.js
│   ├── api-tools.js
│   └── index.js
└── src/                   # Application code
    ├── agents/            # Agent configurations
    └── utils/             # Utilities
```

## TypeScript Setup

For TypeScript projects:

### 1. Install TypeScript Dependencies

```bash
npm install -D typescript @types/node
npm install @agentage/sdk
```

### 2. Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 3. Update `package.json`

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  }
}
```

### 4. Create `src/index.ts`

```typescript
import { agent } from '@agentage/sdk';
import 'dotenv/config';

const assistant = agent('assistant')
  .model('gpt-4')
  .instructions('You are a helpful assistant');

const response = await assistant.send('Hello!');
console.log(response.content);
```

### 5. Build and Run

```bash
npm run dev
```

## Complete Example

Here's a complete, production-ready example:

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';
import { readFile, writeFile } from 'fs/promises';
import 'dotenv/config';

// Define tools
const readFileTool = tool(
  {
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      path: z.string()
    }
  },
  async ({ path }) => {
    return await readFile(path, 'utf-8');
  }
);

const writeFileTool = tool(
  {
    name: 'write_file',
    description: 'Write content to a file',
    inputSchema: {
      path: z.string(),
      content: z.string()
    }
  },
  async ({ path, content }) => {
    await writeFile(path, content, 'utf-8');
    return `File written successfully to ${path}`;
  }
);

// Create agent
const fileAgent = agent('file-assistant')
  .model('gpt-4', { temperature: 0.3 })
  .instructions(`
    You are a file management assistant.
    Help users read, write, and manage files.
    Always confirm actions before executing them.
  `)
  .tools([readFileTool, writeFileTool]);

// Use agent
const main = async () => {
  try {
    const result = await fileAgent.send(
      'Read package.json and create a summary in summary.txt'
    );
    console.log(result.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

main();
```

## Next Steps

Now that you've built your first agent, explore more:

- **[Tool Development](./tool-development.md)** - Create powerful custom tools
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Advanced Usage](./advanced-usage.md)** - Advanced patterns and techniques
- **[Examples](../examples/)** - More working examples

## Common Patterns

### Error Handling

```typescript
try {
  const result = await agent.send('message');
  console.log(result.content);
} catch (error) {
  if (error.code === 'OPENAI_API_ERROR') {
    console.error('API Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

### Conversation Loop

```typescript
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const chat = async () => {
  rl.question('You: ', async (message) => {
    if (message.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    
    const response = await assistant.send(message);
    console.log('Agent:', response.content);
    chat();
  });
};

chat();
```

### Multiple Agents

```typescript
const researcher = agent('researcher')
  .model('gpt-4')
  .instructions('Research topics thoroughly');

const writer = agent('writer')
  .model('gpt-4')
  .instructions('Write clear, engaging content');

// Use them together
const research = await researcher.send('Research AI trends');
const article = await writer.send(`Write an article about: ${research.content}`);
```

## Troubleshooting

### Issue: "Cannot find module '@agentage/sdk'"

**Solution**: Make sure you've installed the package:
```bash
npm install @agentage/sdk
```

### Issue: "OpenAI API key not found"

**Solution**: Set your API key in `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Issue: "Module not found" errors in TypeScript

**Solution**: Set `"moduleResolution": "node"` in `tsconfig.json`

### Need More Help?

- [Troubleshooting Guide](../README.md#troubleshooting)
- [GitHub Issues](https://github.com/agentage/agentkit/issues)
- [GitHub Discussions](https://github.com/agentage/agentkit/discussions)

---

**Congratulations!** You've built your first AI agent. Continue learning in the [Tool Development Guide](./tool-development.md).
