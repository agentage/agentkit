# Developer Debug Panel

The Developer Debug Panel is a debugging utility for AgentKit that helps you inspect and debug agent execution in real-time. It's designed to be used during development to understand how your agents are working.

## Features

- 🔧 **Agent Configuration Logging**: View agent setup and configuration
- 💬 **Message Tracking**: See all messages sent to and from agents
- 🔨 **Tool Call Monitoring**: Track tool invocations and their arguments
- ✅ **Response Inspection**: Examine model responses and metadata
- ❌ **Error Logging**: Capture and display errors during execution
- 📊 **Visual Panel**: Display a formatted summary of all events

## Quick Start

### Enable Dev Mode on Agent

```typescript
import { agent, initDevPanel, showDevPanel } from '@agentage/sdk';

// Initialize dev panel (optional - automatically enabled in NODE_ENV=development)
initDevPanel({
  enabled: true,
  logLevel: 'verbose', // 'verbose' | 'normal' | 'minimal'
  showTimestamps: true,
});

// Enable dev mode on your agent
const assistant = agent('my-agent')
  .model('gpt-4')
  .instructions('You are helpful')
  .devMode(true); // <-- Enable dev panel logging

// Use agent normally
const response = await assistant.send('Hello!');

// Show the dev panel summary
showDevPanel();
```

## Configuration

### Dev Panel Config

```typescript
interface DevPanelConfig {
  enabled?: boolean;        // Enable/disable the panel
  logLevel?: 'verbose' | 'normal' | 'minimal';  // Logging verbosity
  showTimestamps?: boolean; // Show timestamps on logs
}
```

### Initialization

The dev panel can be initialized explicitly or will auto-initialize on first use:

```typescript
// Explicit initialization
import { initDevPanel } from '@agentage/sdk';

const devPanel = initDevPanel({
  enabled: true,
  logLevel: 'verbose',
  showTimestamps: true,
});
```

### Auto-Enable in Development

The dev panel automatically enables when `NODE_ENV=development`:

```bash
NODE_ENV=development npm start
```

## Usage Examples

### Example 1: Basic Usage

```typescript
import { agent, initDevPanel, showDevPanel } from '@agentage/sdk';

// Enable dev panel
initDevPanel({ enabled: true });

// Create agent with dev mode
const bot = agent('bot')
  .model('gpt-4')
  .devMode(true); // Enable debug logging

await bot.send('Hello!');

// Display summary
showDevPanel();
```

### Example 2: With Tools

```typescript
import { agent, tool, initDevPanel, showDevPanel } from '@agentage/sdk';
import { z } from 'zod';

// Initialize dev panel
initDevPanel({ enabled: true, logLevel: 'verbose' });

// Define a tool
const weatherTool = tool(
  {
    name: 'get_weather',
    description: 'Get weather info',
    inputSchema: {
      city: z.string(),
    },
  },
  async ({ city }) => ({ city, temp: 72, condition: 'Sunny' })
);

// Create agent with dev mode
const assistant = agent('weather-bot')
  .model('gpt-4')
  .tools([weatherTool])
  .devMode(true);

// Tool calls will be logged
await assistant.send('What is the weather in SF?');

// Show all logged events
showDevPanel();
```

### Example 3: Multiple Agents

```typescript
import { agent, getDevPanel } from '@agentage/sdk';

// Get the global dev panel instance
const devPanel = getDevPanel();

// Create multiple agents with dev mode
const agent1 = agent('agent-1').model('gpt-4').devMode(true);
const agent2 = agent('agent-2').model('gpt-4').devMode(true);

// Both agents log to the same dev panel
await agent1.send('Hello from agent 1');
await agent2.send('Hello from agent 2');

// View all events from both agents
devPanel.show();
```

## Dev Panel API

### `initDevPanel(config?)`

Initialize the global dev panel instance.

```typescript
const devPanel = initDevPanel({
  enabled: true,
  logLevel: 'normal',
  showTimestamps: true,
});
```

### `getDevPanel()`

Get the global dev panel instance (creates one if it doesn't exist).

```typescript
const devPanel = getDevPanel();
```

### `showDevPanel()`

Display the dev panel summary with all logged events.

```typescript
showDevPanel();
```

### `clearDevPanel()`

Clear all logged events from the dev panel.

```typescript
clearDevPanel();
```

### Dev Panel Instance Methods

#### `isEnabled(): boolean`

Check if the dev panel is enabled.

```typescript
const devPanel = getDevPanel();
console.log('Enabled:', devPanel.isEnabled());
```

#### `getEvents(): DevPanelEvent[]`

Get all logged events.

```typescript
const devPanel = getDevPanel();
const events = devPanel.getEvents();
console.log(`Total events: ${events.length}`);
```

#### `clear(): void`

Clear all events.

```typescript
const devPanel = getDevPanel();
devPanel.clear();
```

#### `show(): void`

Display the visual panel with all events.

```typescript
const devPanel = getDevPanel();
devPanel.show();
```

## Event Types

The dev panel tracks different types of events:

- **config**: Agent configuration
- **message**: Messages sent to agents
- **tool_call**: Tool invocations
- **response**: Model responses
- **error**: Errors during execution

## Log Levels

### `verbose`

Logs everything including full data payloads:

```
[2026-01-06T10:30:00.000Z] 🔧 Agent Configuration: { name: 'bot', model: 'gpt-4', ... }
[2026-01-06T10:30:01.000Z] 💬 Message: { role: 'user', content: 'Hello' }
[2026-01-06T10:30:02.000Z] ✅ Response: { content: 'Hi there!', metadata: { ... } }
```

### `normal` (default)

Logs events without configuration details:

```
[2026-01-06T10:30:00.000Z] 💬 Message: { role: 'user', content: 'Hello' }
[2026-01-06T10:30:01.000Z] ✅ Response: { content: 'Hi there!' }
```

### `minimal`

Logs only messages, tool calls, responses, and errors (no config):

```
[2026-01-06T10:30:00.000Z] 💬 Message: { role: 'user', content: 'Hello' }
[2026-01-06T10:30:01.000Z] ✅ Response: { content: 'Hi there!' }
```

## Tips

1. **Use in Development Only**: The dev panel is designed for development. Disable it in production.

2. **Enable Selectively**: Only enable dev mode on agents you're debugging:
   ```typescript
   const debugAgent = agent('debug').devMode(true);
   const prodAgent = agent('prod').devMode(false);
   ```

3. **Clear Between Tests**: Clear the panel between test runs:
   ```typescript
   beforeEach(() => {
     clearDevPanel();
   });
   ```

4. **Check Event Count**: Monitor event counts to ensure logging is working:
   ```typescript
   const devPanel = getDevPanel();
   console.log(`Events logged: ${devPanel.getEvents().length}`);
   ```

5. **Timestamp Analysis**: Enable timestamps to analyze execution timing:
   ```typescript
   initDevPanel({ showTimestamps: true });
   ```

## Environment Variables

### `NODE_ENV=development`

Automatically enables the dev panel:

```bash
NODE_ENV=development node app.js
```

## Complete Example

See the [devpanel example](/examples/agent-sdk-devpanel-example) for a complete working example.

## Troubleshooting

### Dev Panel Not Logging

1. Check if dev panel is enabled:
   ```typescript
   console.log('Enabled:', getDevPanel().isEnabled());
   ```

2. Verify dev mode is enabled on agent:
   ```typescript
   const agent = agent('bot').devMode(true);
   ```

3. Check NODE_ENV:
   ```bash
   echo $NODE_ENV
   ```

### No Output When Calling `showDevPanel()`

The panel may be disabled. Enable it explicitly:

```typescript
initDevPanel({ enabled: true });
```

### Too Much Output

Reduce log level:

```typescript
initDevPanel({ logLevel: 'minimal' });
```

Or disable timestamps:

```typescript
initDevPanel({ showTimestamps: false });
```

## Best Practices

1. **Development Only**: Never enable dev panel in production
2. **Selective Enabling**: Only enable on agents you're debugging
3. **Clear Regularly**: Clear events between test runs
4. **Use Log Levels**: Choose appropriate log level for your needs
5. **Monitor Performance**: Dev panel adds overhead, disable when not needed

## See Also

- [Getting Started Guide](/docs/getting-started.md)
- [API Reference](/docs/api-reference.md)
- [Dev Panel Example](/examples/agent-sdk-devpanel-example)
