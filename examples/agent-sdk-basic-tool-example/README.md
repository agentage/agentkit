# Agent SDK Basic Tool Example

Example showing how to define and use tools with AgentKit SDK.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
```

## Run

```bash
npm start
```

Or run in watch mode:
```bash
npm run dev
```

## What it does

- Creates a calculator tool using the `tool()` factory
- Defines tool schema with parameters and types
- Implements the tool's execute function
- Creates an agent with the tool attached
- Shows tool definition structure

## Code

```typescript
import { agent, tool } from '@agentage/sdk';

// Define a tool
const calculatorTool = tool({
  name: 'calculator',
  description: 'Performs basic arithmetic operations',
  schema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
  execute: async (params) => {
    const result = /* calculate */;
    return [{ role: 'tool', content: `Result: ${result}`, toolCallId: 'calc_1' }];
  },
});

// Create agent with tool
const assistant = agent('math-assistant')
  .model('gpt-4', { temperature: 0.7 })
  .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
  .instructions('You are a helpful math assistant.')
  .tools([calculatorTool]);

const response = await assistant.send('What is 15 plus 27?');
```

## Features

✅ **Tool calling is fully implemented!** The agent will:
- Receive your message
- Decide if it needs to use a tool
- Call the calculator tool with appropriate parameters
- Execute the tool function
- Return the final response with the calculation result

## Tool Execution Flow

1. User sends message: "What is 15 plus 27?"
2. Agent analyzes and decides to use the calculator tool
3. Agent calls: `calculator({ operation: 'add', a: 15, b: 27 })`
4. Tool executes and returns: `[{ role: 'tool', content: 'Result: 42', toolCallId: '...' }]`
5. Agent receives tool result and formulates final response
6. User receives: "The sum of 15 and 27 is 42."
