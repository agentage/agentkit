# Advanced Usage

Advanced patterns, techniques, and optimizations for AgentKit.

## Table of Contents

- [Multi-Agent Systems](#multi-agent-systems)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Conversation Management](#conversation-management)
- [Tool Composition](#tool-composition)
- [Custom Model Adapters](#custom-model-adapters)
- [Configuration Management](#configuration-management)
- [Production Deployment](#production-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Security Best Practices](#security-best-practices)

## Multi-Agent Systems

### Agent Coordination

Use multiple specialized agents working together:

```typescript
import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';

// Specialized agents
const researcher = agent('researcher')
  .model('gpt-4', { temperature: 0.3 })
  .instructions('Research topics thoroughly and provide factual information');

const writer = agent('writer')
  .model('gpt-4', { temperature: 0.8 })
  .instructions('Write engaging, creative content based on research');

const editor = agent('editor')
  .model('gpt-4', { temperature: 0.2 })
  .instructions('Edit content for clarity, grammar, and consistency');

// Workflow
const topic = 'AI in healthcare';

const research = await researcher.send(`Research: ${topic}`);
const draft = await writer.send(`Write article based on: ${research.content}`);
const final = await editor.send(`Edit this article: ${draft.content}`);

console.log(final.content);
```

### Agent Pipeline

```typescript
interface PipelineStep {
  agent: Agent;
  transform?: (input: string, response: AgentResponse) => string;
}

const runPipeline = async (
  input: string,
  steps: PipelineStep[]
): Promise<AgentResponse> => {
  let currentInput = input;
  let lastResponse: AgentResponse = { content: '' };
  
  for (const step of steps) {
    lastResponse = await step.agent.send(currentInput);
    
    if (step.transform) {
      currentInput = step.transform(currentInput, lastResponse);
    } else {
      currentInput = lastResponse.content;
    }
  }
  
  return lastResponse;
};

// Usage
const result = await runPipeline('Create a blog post about TypeScript', [
  { agent: researcher },
  { agent: writer },
  {
    agent: editor,
    transform: (_, response) => `Final edit: ${response.content}`
  }
]);
```

### Parallel Agent Execution

```typescript
const analyzeFromMultiplePerspectives = async (topic: string) => {
  const technical = agent('technical')
    .model('gpt-4')
    .instructions('Analyze from technical perspective');
  
  const business = agent('business')
    .model('gpt-4')
    .instructions('Analyze from business perspective');
  
  const user = agent('user-experience')
    .model('gpt-4')
    .instructions('Analyze from user experience perspective');
  
  // Run in parallel
  const [techResult, bizResult, uxResult] = await Promise.all([
    technical.send(topic),
    business.send(topic),
    user.send(topic)
  ]);
  
  // Synthesize results
  const synthesizer = agent('synthesizer')
    .model('gpt-4')
    .instructions('Synthesize multiple perspectives into coherent analysis');
  
  return synthesizer.send(`
    Technical: ${techResult.content}
    Business: ${bizResult.content}
    UX: ${uxResult.content}
  `);
};
```

## Error Handling

### Comprehensive Error Handling

```typescript
import {
  MissingApiKeyError,
  UnsupportedModelError,
  ToolNotFoundError,
  NotImplementedError
} from '@agentage/sdk';

const safeAgentExecution = async (
  agentInstance: Agent,
  message: string
): Promise<AgentResponse | null> => {
  try {
    return await agentInstance.send(message);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      console.error('API key not configured. Set OPENAI_API_KEY.');
      return null;
    }
    
    if (error instanceof UnsupportedModelError) {
      console.error('Unsupported model:', error.message);
      return null;
    }
    
    if (error instanceof ToolNotFoundError) {
      console.error('Tool not found:', error.message);
      return null;
    }
    
    if (error instanceof NotImplementedError) {
      console.error('Feature not implemented:', error.message);
      return null;
    }
    
    // Network or API errors
    if (error.message.includes('fetch')) {
      console.error('Network error. Check connection.');
      return null;
    }
    
    // Unknown error
    console.error('Unexpected error:', error);
    throw error;
  }
};
```

### Retry Logic

```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Usage
const response = await retryWithBackoff(() => 
  agent('assistant').model('gpt-4').send('Hello')
);
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

try {
  const response = await breaker.execute(() =>
    agent('assistant').model('gpt-4').send('Hello')
  );
} catch (error) {
  console.error('Circuit breaker prevented execution');
}
```

## Performance Optimization

### Response Caching

```typescript
interface CacheEntry {
  response: AgentResponse;
  timestamp: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  
  constructor(private ttl: number = 3600000) {} // 1 hour default
  
  get(key: string): AgentResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }
  
  set(key: string, response: AgentResponse): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Usage
const cache = new ResponseCache();

const cachedAgent = async (
  agentInstance: Agent,
  message: string
): Promise<AgentResponse> => {
  const cacheKey = `${agentInstance.getConfig().name}:${message}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('Cache hit');
    return cached;
  }
  
  const response = await agentInstance.send(message);
  cache.set(cacheKey, response);
  return response;
};
```

### Request Batching

```typescript
class RequestBatcher {
  private queue: Array<{
    message: string;
    resolve: (response: AgentResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  
  private timeout: NodeJS.Timeout | null = null;
  
  constructor(
    private agent: Agent,
    private batchSize: number = 5,
    private batchDelay: number = 100
  ) {}
  
  async send(message: string): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ message, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }
  
  private async processBatch(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    const batch = this.queue.splice(0);
    
    // Process batch
    for (const item of batch) {
      try {
        const response = await this.agent.send(item.message);
        item.resolve(response);
      } catch (error) {
        item.reject(error as Error);
      }
    }
  }
}
```

### Token Usage Optimization

```typescript
const optimizeInstructions = (instructions: string): string => {
  return instructions
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
};

const efficientAgent = agent('efficient')
  .model('gpt-4', {
    temperature: 0.7,
    maxTokens: 500  // Limit response size
  })
  .instructions(optimizeInstructions(`
    You are a helpful assistant.
    Be concise.
    Provide direct answers.
  `));
```

## Conversation Management

### Conversation History

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

class Conversation {
  private history: Message[] = [];
  
  constructor(private agent: Agent) {}
  
  async send(message: string): Promise<AgentResponse> {
    this.history.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    const response = await this.agent.send(message);
    
    this.history.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date()
    });
    
    return response;
  }
  
  getHistory(): Message[] {
    return [...this.history];
  }
  
  clear(): void {
    this.history = [];
  }
  
  export(): string {
    return JSON.stringify(this.history, null, 2);
  }
  
  import(json: string): void {
    this.history = JSON.parse(json);
  }
}

// Usage
const conversation = new Conversation(
  agent('assistant').model('gpt-4').instructions('Be helpful')
);

await conversation.send('Hello');
await conversation.send('What is TypeScript?');

console.log(conversation.getHistory());
```

### Context Window Management

```typescript
class ContextManager {
  private maxTokens: number;
  
  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens;
  }
  
  // Approximate token count (4 chars ≈ 1 token)
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  truncateContext(messages: Message[]): Message[] {
    let totalTokens = 0;
    const result: Message[] = [];
    
    // Keep most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const tokens = this.estimateTokens(messages[i].content);
      
      if (totalTokens + tokens > this.maxTokens) {
        break;
      }
      
      totalTokens += tokens;
      result.unshift(messages[i]);
    }
    
    return result;
  }
}
```

## Tool Composition

### Tool Chains

```typescript
const createToolChain = (tools: Tool<any, any>[]) => {
  return async (input: any) => {
    let result = input;
    
    for (const tool of tools) {
      result = await tool.execute(result);
    }
    
    return result;
  };
};

// Usage
const readFile = tool(/* ... */);
const parseJSON = tool(/* ... */);
const validateData = tool(/* ... */);

const chain = createToolChain([readFile, parseJSON, validateData]);
const result = await chain({ path: 'data.json' });
```

### Conditional Tool Execution

```typescript
const conditionalTool = <T, R>(
  condition: (input: T) => boolean,
  trueTool: Tool<T, R>,
  falseTool: Tool<T, R>
) => {
  return tool(
    {
      name: 'conditional',
      description: 'Execute tool based on condition',
      inputSchema: trueTool.schema
    },
    async (input: T) => {
      if (condition(input)) {
        return trueTool.execute(input);
      }
      return falseTool.execute(input);
    }
  );
};
```

## Custom Model Adapters

### Creating a Custom Adapter

```typescript
import type { ModelProvider } from '@agentage/core';

class CustomModelAdapter implements ModelProvider {
  constructor(private apiKey: string) {}
  
  async complete(params: {
    model: string;
    messages: Message[];
    temperature?: number;
  }): Promise<AgentResponse> {
    // Custom implementation
    const response = await fetch('https://api.custom-llm.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature
      })
    });
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      metadata: {
        id: data.id,
        model: data.model,
        usage: data.usage
      }
    };
  }
}
```

## Configuration Management

### Environment-Based Configuration

```typescript
interface EnvironmentConfig {
  openaiApiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
}

const loadConfig = (): EnvironmentConfig => {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    modelName: process.env.MODEL_NAME || 'gpt-4',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MAX_TOKENS || '1000', 10)
  };
};

const config = loadConfig();

const agent = agent('production-agent')
  .model(config.modelName, {
    temperature: config.temperature,
    maxTokens: config.maxTokens
  })
  .config([
    { key: 'OPENAI_API_KEY', value: config.openaiApiKey }
  ]);
```

## Production Deployment

### Health Checks

```typescript
const healthCheck = async (agentInstance: Agent): Promise<boolean> => {
  try {
    const response = await agentInstance.send('ping');
    return response.content !== '';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
```

### Graceful Shutdown

```typescript
class AgentService {
  private isShuttingDown = false;
  
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    console.log('Shutting down gracefully...');
    
    // Wait for ongoing requests
    await this.waitForPendingRequests();
    
    // Cleanup
    this.cleanup();
    
    console.log('Shutdown complete');
  }
  
  private async waitForPendingRequests(): Promise<void> {
    // Implementation
  }
  
  private cleanup(): void {
    // Close connections, clear caches, etc.
  }
}
```

## Monitoring & Logging

### Structured Logging

```typescript
interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  log(entry: LogEntry): void {
    const formatted = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    });
    console.log(formatted);
  }
}

const logger = new Logger();

// Usage
const response = await agent.send(message);
logger.log({
  timestamp: new Date(),
  level: 'info',
  message: 'Agent response received',
  metadata: {
    agentName: agent.getConfig().name,
    messageLength: message.length,
    responseLength: response.content.length,
    usage: response.metadata?.usage
  }
});
```

### Performance Metrics

```typescript
class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();
  
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
  
  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  getP95(name: string): number {
    const values = (this.metrics.get(name) || []).sort((a, b) => a - b);
    const index = Math.floor(values.length * 0.95);
    return values[index] || 0;
  }
}

const metrics = new MetricsCollector();

const start = Date.now();
const response = await agent.send(message);
metrics.record('response_time', Date.now() - start);
```

## Security Best Practices

### Input Sanitization

```typescript
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')  // Remove HTML tags
    .trim()
    .slice(0, 5000);  // Limit length
};

const safeAgent = async (message: string) => {
  const sanitized = sanitizeInput(message);
  return agent('secure').model('gpt-4').send(sanitized);
};
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async acquire(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(Date.now());
  }
}

const limiter = new RateLimiter(10, 60000); // 10 requests per minute

await limiter.acquire();
const response = await agent.send(message);
```

---

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Tool Development](./tool-development.md) - Creating custom tools
- [Migration Guide](./migration.md) - Upgrading between versions

---

**Need help?** Check out [GitHub Discussions](https://github.com/agentage/agentkit/discussions).
