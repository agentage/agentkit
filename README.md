# AgentKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/agentage/agentkit/actions/workflows/ci.yml/badge.svg)](https://github.com/agentage/agentkit/actions/workflows/ci.yml)

TypeScript SDK for building agents on the [Agentage](https://agentage.io) platform.

## Packages

| Package | Description |
|---------|-------------|
| [`@agentage/core`](packages/core) | Agent interface, run model, state machine, event types |
| [`@agentage/platform`](packages/platform) | Daemon/hub protocol types — machine, heartbeat, WebSocket messages |

## Quick Start

```bash
npm install @agentage/core
```

```typescript
import { createAgent } from '@agentage/core';

const agent = createAgent({
  name: 'hello-agent',
  description: 'A simple hello agent',
  path: './hello-agent',
  async *run(input) {
    yield {
      type: 'output',
      data: { type: 'output', content: `Hello: ${input.task}`, format: 'text' },
      timestamp: Date.now(),
    };
    yield {
      type: 'result',
      data: { type: 'result', success: true, output: 'done' },
      timestamp: Date.now(),
    };
  },
});

const process = await agent.run({ task: 'world' });
for await (const event of process.events) {
  console.log(event.type, event.data);
}
```

## Development

```bash
# Install
npm ci

# Full verify (type-check + lint + format + test + build)
npm run verify

# Test with coverage
npm run test:coverage
```

Requires Node.js >= 22.0.0.

## License

MIT
