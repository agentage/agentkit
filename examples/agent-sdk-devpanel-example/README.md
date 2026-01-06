# Dev Panel Example

This example demonstrates how to use the AgentKit Developer Panel for debugging agent execution.

## Features

- Initialize and configure the dev panel
- Enable dev mode on agents
- View real-time logging of:
  - Agent configuration
  - Messages sent/received
  - Tool calls and results
  - Model responses
- Display a visual summary panel

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

3. Install dependencies (from the repo root):
   ```bash
   npm install
   ```

## Run

```bash
npm start
```

## Dev Mode

The dev panel is automatically enabled when `NODE_ENV=development` or can be explicitly enabled:

```typescript
// Explicit initialization
const devPanel = initDevPanel({
  enabled: true,
  logLevel: 'verbose', // 'verbose' | 'normal' | 'minimal'
  showTimestamps: true,
});

// Enable on agent
const agent = agent('my-agent')
  .model('gpt-4')
  .devMode(true); // Enable dev panel logging for this agent
```

## Output

The dev panel logs:
- 🔧 Agent Configuration
- 💬 Messages
- 🔨 Tool Calls
- ✅ Responses
- ❌ Errors

And displays a summary panel at the end with all events.
