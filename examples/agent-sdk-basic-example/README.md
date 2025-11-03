# ChatGPT Basic Example

Super simple TypeScript example showing how to use AgentKit SDK with OpenAI's ChatGPT.

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

- Creates an agent using AgentKit SDK builder pattern
- Sends a message using the SDK's `send()` method
- Displays the response from GPT-4
- Shows usage metadata
- Fully typed with TypeScript

## Code

```typescript
import { agent } from '@agentage/sdk';

const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
  .instructions('You are a helpful assistant');

const response = await assistant.send('Hello!');
console.log(response.content);
```

## Next Steps

Check out more advanced examples:
- `chatgpt-with-tools` - Using function calling
- `chatgpt-streaming` - Streaming responses
