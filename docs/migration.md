# Migration Guide

Guide for upgrading between AgentKit versions.

## Table of Contents

- [Version 0.1.x to 0.2.x](#version-01x-to-02x)
- [Version 0.0.x to 0.1.x](#version-00x-to-01x)
- [General Migration Tips](#general-migration-tips)

## Version 0.1.x to 0.2.x

**Status**: Future release (not yet available)

### Planned Changes

The following changes are planned for version 0.2.x:

#### Streaming Support

```typescript
// v0.1.x - Not supported
// throws NotImplementedError

// v0.2.x - Streaming will be available
const agent = agent('assistant').model('gpt-4');

for await (const chunk of agent.stream('Hello')) {
  process.stdout.write(chunk.content);
}
```

#### Enhanced Tool Types

```typescript
// v0.1.x
const tool = tool({ /* ... */ }, async (params) => { /* ... */ });

// v0.2.x - Additional tool metadata
const tool = tool({
  name: 'my_tool',
  description: 'Tool description',
  category: 'utility',  // NEW
  tags: ['file', 'io'],  // NEW
  version: '1.0.0',      // NEW
  inputSchema: { /* ... */ }
}, async (params) => { /* ... */ });
```

#### Breaking Changes (Planned)

None planned for 0.2.x. The release will be backward compatible.

## Version 0.0.x to 0.1.x

### Breaking Changes

#### 1. Package Imports

**Before (0.0.x)**:
```typescript
import { createAgent } from '@agentage/sdk';
```

**After (0.1.x)**:
```typescript
import { agent } from '@agentage/sdk';
```

#### 2. Agent Creation API

**Before (0.0.x)**:
```typescript
const myAgent = createAgent({
  name: 'assistant',
  modelName: 'gpt-4',
  systemPrompt: 'You are helpful'
});
```

**After (0.1.x)** - Builder Pattern:
```typescript
const myAgent = agent('assistant')
  .model('gpt-4')
  .instructions('You are helpful');
```

**After (0.1.x)** - Config Pattern:
```typescript
const myAgent = agent({
  name: 'assistant',
  model: 'gpt-4',
  instructions: 'You are helpful'
});
```

#### 3. Tool Definition

**Before (0.0.x)**:
```typescript
const myTool = {
  name: 'my_tool',
  description: 'Description',
  parameters: {
    param1: { type: 'string' }
  },
  execute: async (params) => { /* ... */ }
};
```

**After (0.1.x)**:
```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const myTool = tool(
  {
    name: 'my_tool',
    description: 'Description',
    inputSchema: {
      param1: z.string()
    }
  },
  async (params) => { /* ... */ }
);
```

#### 4. Response Format

**Before (0.0.x)**:
```typescript
const response = await agent.send('Hello');
// response: string
console.log(response);
```

**After (0.1.x)**:
```typescript
const response = await agent.send('Hello');
// response: AgentResponse
console.log(response.content);
console.log(response.metadata);
```

### Migration Steps

#### Step 1: Update Dependencies

```bash
npm install @agentage/sdk@latest
npm install zod  # Required for tool schemas
```

#### Step 2: Update Imports

Replace:
```typescript
import { createAgent, createTool } from '@agentage/sdk';
```

With:
```typescript
import { agent, tool } from '@agentage/sdk';
```

#### Step 3: Update Agent Creation

**Old Code**:
```typescript
const assistant = createAgent({
  name: 'assistant',
  modelName: 'gpt-4',
  systemPrompt: 'You are helpful',
  temperature: 0.7
});
```

**New Code** (choose one pattern):
```typescript
// Builder pattern
const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are helpful');

// OR Config pattern
const assistant = agent({
  name: 'assistant',
  model: {
    name: 'gpt-4',
    config: { temperature: 0.7 }
  },
  instructions: 'You are helpful'
});
```

#### Step 4: Update Tool Definitions

**Old Code**:
```typescript
const readFile = {
  name: 'read_file',
  description: 'Read a file',
  parameters: {
    path: { type: 'string', required: true }
  },
  execute: async ({ path }) => {
    return await fs.readFile(path, 'utf-8');
  }
};
```

**New Code**:
```typescript
import { z } from 'zod';

const readFile = tool(
  {
    name: 'read_file',
    description: 'Read a file',
    inputSchema: {
      path: z.string()
    }
  },
  async ({ path }) => {
    return await fs.readFile(path, 'utf-8');
  }
);
```

#### Step 5: Update Response Handling

**Old Code**:
```typescript
const response = await agent.send('Hello');
console.log(response);  // Direct string
```

**New Code**:
```typescript
const response = await agent.send('Hello');
console.log(response.content);     // Message content
console.log(response.metadata);    // Additional metadata
```

### Complete Example Migration

**Before (0.0.x)**:
```typescript
import { createAgent } from '@agentage/sdk';

const assistant = createAgent({
  name: 'assistant',
  modelName: 'gpt-4',
  systemPrompt: 'You are helpful',
  temperature: 0.7,
  tools: [
    {
      name: 'search',
      description: 'Search',
      parameters: {
        query: { type: 'string', required: true }
      },
      execute: async ({ query }) => {
        return searchResults(query);
      }
    }
  ]
});

const response = await assistant.send('Search for AI');
console.log(response);
```

**After (0.1.x)**:
```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';

const searchTool = tool(
  {
    name: 'search',
    description: 'Search',
    inputSchema: {
      query: z.string()
    }
  },
  async ({ query }) => {
    return searchResults(query);
  }
);

const assistant = agent('assistant')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are helpful')
  .tools([searchTool]);

const response = await assistant.send('Search for AI');
console.log(response.content);
```

## General Migration Tips

### 1. Test Incrementally

Migrate one agent or tool at a time and test thoroughly:

```typescript
// Keep old version running
const oldAgent = createAgent({ /* ... */ });  // 0.0.x

// Test new version alongside
const newAgent = agent('test')  // 0.1.x
  .model('gpt-4')
  .instructions('...');

// Compare results
const oldResult = await oldAgent.send('test');
const newResult = await newAgent.send('test');
```

### 2. Use Type Checking

Enable strict TypeScript mode to catch migration issues:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 3. Update Tests

Update your test files to use the new API:

```typescript
// Old test
describe('agent', () => {
  it('should respond', async () => {
    const agent = createAgent({ /* ... */ });
    const response = await agent.send('test');
    expect(response).toBe('...');
  });
});

// New test
describe('agent', () => {
  it('should respond', async () => {
    const myAgent = agent('test').model('gpt-4');
    const response = await myAgent.send('test');
    expect(response.content).toBe('...');
  });
});
```

### 4. Check Dependencies

Ensure all dependencies are compatible:

```bash
npm list @agentage/sdk
npm list zod
npm outdated
```

### 5. Review Changelog

Always review the [CHANGELOG.md](../CHANGELOG.md) for detailed information about changes.

### 6. Gradual Migration

For large codebases, consider a gradual migration:

1. Update dependencies
2. Migrate utility functions
3. Migrate tools
4. Migrate agents
5. Update tests
6. Deploy incrementally

### 7. Backup Before Migration

```bash
git checkout -b migration-to-0.1.x
git add .
git commit -m "chore: backup before migration"
```

### 8. Use Codemods (Future)

We plan to provide codemods for automated migration in future releases.

## Common Issues

### Issue 1: Type Errors with Tool Schemas

**Problem**:
```typescript
// Error: Type 'ZodString' is not assignable to type 'ToolSchema'
const tool = tool({
  inputSchema: z.string()  // Wrong!
}, /* ... */);
```

**Solution**:
```typescript
// Use object with Zod schemas
const tool = tool({
  inputSchema: {
    param: z.string()  // Correct!
  }
}, /* ... */);
```

### Issue 2: Response Content Undefined

**Problem**:
```typescript
const response = await agent.send('Hello');
console.log(response);  // Logs object, not string
```

**Solution**:
```typescript
const response = await agent.send('Hello');
console.log(response.content);  // Access .content property
```

### Issue 3: Model Configuration

**Problem**:
```typescript
// Old way doesn't work
agent.model('gpt-4').temperature(0.7);
```

**Solution**:
```typescript
// Pass config as second parameter
agent.model('gpt-4', { temperature: 0.7 });
```

## Deprecation Warnings

No features are currently deprecated. All v0.1.x APIs will be supported in v0.2.x.

## Getting Help

If you encounter issues during migration:

- **GitHub Issues**: [Report migration issues](https://github.com/agentage/agentkit/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/agentage/agentkit/discussions)
- **Documentation**: [Full docs](./README.md)
- **Examples**: [Working examples](../examples/)

## Version Support

| Version | Status | Support End |
|---------|--------|-------------|
| 0.1.x   | Current | Active |
| 0.0.x   | Deprecated | 2024-12-31 |

---

**Questions?** Open a [discussion](https://github.com/agentage/agentkit/discussions) for migration help.
