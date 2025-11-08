# Tool Development Guide

Learn how to create powerful, type-safe tools for your AI agents.

## Table of Contents

- [What Are Tools?](#what-are-tools)
- [Basic Tool Creation](#basic-tool-creation)
- [Tool Schema Design](#tool-schema-design)
- [Type Safety](#type-safety)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Real-World Examples](#real-world-examples)
- [Testing Tools](#testing-tools)

## What Are Tools?

Tools extend your agent's capabilities by providing executable functions. When an agent needs to perform an action (like reading a file, calling an API, or calculating something), it can use tools.

### Key Benefits

- **Type-safe**: Automatic validation with Zod schemas
- **Composable**: Combine multiple tools
- **Reusable**: Share tools across agents
- **Testable**: Easy to unit test

### How Tools Work

1. **Define**: Create tool with schema and execution function
2. **Provide**: Give tool to agent via `.tools()`
3. **Execute**: Agent decides when to call tool
4. **Return**: Tool returns result to agent
5. **Continue**: Agent uses result to formulate response

## Basic Tool Creation

### Minimal Example

```typescript
import { tool } from '@agentage/sdk';
import { z } from 'zod';

const greetTool = tool(
  {
    name: 'greet',
    description: 'Greet a person by name',
    inputSchema: {
      name: z.string()
    }
  },
  async ({ name }) => {
    return `Hello, ${name}!`;
  }
);
```

### Anatomy of a Tool

```typescript
const myTool = tool(
  // Configuration
  {
    name: 'tool_name',           // Unique identifier
    description: 'What it does', // Clear description
    inputSchema: {               // Zod schema object
      param1: z.string(),
      param2: z.number().optional()
    }
  },
  // Execution function
  async (params) => {
    // params is typed automatically!
    // params.param1 is string
    // params.param2 is number | undefined
    return result;
  }
);
```

## Tool Schema Design

### Required Parameters

```typescript
const searchTool = tool(
  {
    name: 'search',
    description: 'Search for information',
    inputSchema: {
      query: z.string(),
      type: z.enum(['web', 'images', 'news'])
    }
  },
  async ({ query, type }) => {
    // Both parameters are required
    return performSearch(query, type);
  }
);
```

### Optional Parameters

```typescript
const fetchTool = tool(
  {
    name: 'fetch_url',
    description: 'Fetch data from a URL',
    inputSchema: {
      url: z.string(),
      method: z.enum(['GET', 'POST']).optional(),
      headers: z.record(z.string()).optional(),
      timeout: z.number().optional()
    }
  },
  async ({ url, method = 'GET', headers = {}, timeout = 5000 }) => {
    // Use defaults for optional parameters
    return fetch(url, { method, headers, timeout });
  }
);
```

### Complex Schemas

```typescript
const createUserTool = tool(
  {
    name: 'create_user',
    description: 'Create a new user account',
    inputSchema: {
      username: z.string().min(3).max(20),
      email: z.string().email(),
      age: z.number().min(13).max(120).optional(),
      role: z.enum(['user', 'admin']).default('user'),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.unknown()).optional()
    }
  },
  async (params) => {
    // All validation happens automatically
    return createUser(params);
  }
);
```

### Nested Objects

```typescript
const orderTool = tool(
  {
    name: 'create_order',
    description: 'Create a new order',
    inputSchema: {
      customer: z.object({
        name: z.string(),
        email: z.string().email()
      }),
      items: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          price: z.number().positive()
        })
      ),
      shipping: z.object({
        address: z.string(),
        city: z.string(),
        zipCode: z.string()
      }).optional()
    }
  },
  async ({ customer, items, shipping }) => {
    return createOrder({ customer, items, shipping });
  }
);
```

## Type Safety

### Automatic Type Inference

```typescript
const myTool = tool(
  {
    name: 'example',
    description: 'Example with type inference',
    inputSchema: {
      name: z.string(),
      count: z.number(),
      active: z.boolean().optional()
    }
  },
  // Types are inferred automatically!
  async ({ name, count, active }) => {
    // name is string
    // count is number
    // active is boolean | undefined
    
    // TypeScript knows the types
    const upperName: string = name.toUpperCase();
    const doubled: number = count * 2;
    const status: boolean = active ?? false;
    
    return { upperName, doubled, status };
  }
);
```

### Generic Return Types

```typescript
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const searchTool = tool(
  {
    name: 'search',
    description: 'Search the web',
    inputSchema: {
      query: z.string()
    }
  },
  async ({ query }): Promise<SearchResult[]> => {
    // Return type is enforced
    return [
      {
        title: 'Result 1',
        url: 'https://example.com',
        snippet: 'Description'
      }
    ];
  }
);
```

## Error Handling

### Basic Error Handling

```typescript
import { readFile } from 'fs/promises';

const fileReader = tool(
  {
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      path: z.string()
    }
  },
  async ({ path }) => {
    try {
      return await readFile(path, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
);
```

### Custom Error Types

```typescript
class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

const apiTool = tool(
  {
    name: 'call_api',
    description: 'Call external API',
    inputSchema: {
      endpoint: z.string()
    }
  },
  async ({ endpoint }) => {
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new ToolExecutionError(
          'API request failed',
          'API_ERROR',
          {
            status: response.status,
            statusText: response.statusText
          }
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ToolExecutionError) {
        throw error;
      }
      throw new ToolExecutionError(
        'Network error',
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    }
  }
);
```

### Validation Errors

```typescript
const safeTool = tool(
  {
    name: 'safe_division',
    description: 'Divide two numbers safely',
    inputSchema: {
      numerator: z.number(),
      denominator: z.number()
    }
  },
  async ({ numerator, denominator }) => {
    // Custom validation beyond schema
    if (denominator === 0) {
      throw new Error('Cannot divide by zero');
    }
    
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      throw new Error('Inputs must be finite numbers');
    }
    
    return numerator / denominator;
  }
);
```

## Best Practices

### 1. Clear Descriptions

```typescript
// ❌ Bad: Vague description
const tool1 = tool(
  {
    name: 'do_stuff',
    description: 'Does things',
    inputSchema: { data: z.unknown() }
  },
  async ({ data }) => { /* ... */ }
);

// ✅ Good: Clear, specific description
const tool2 = tool(
  {
    name: 'calculate_total',
    description: 'Calculate the total price including tax and shipping',
    inputSchema: {
      subtotal: z.number().describe('Subtotal before tax'),
      taxRate: z.number().describe('Tax rate as decimal (e.g., 0.08 for 8%)'),
      shippingCost: z.number().describe('Flat shipping cost')
    }
  },
  async ({ subtotal, taxRate, shippingCost }) => {
    return subtotal * (1 + taxRate) + shippingCost;
  }
);
```

### 2. Use Schema Descriptions

```typescript
const userTool = tool(
  {
    name: 'create_user',
    description: 'Create a new user account in the system',
    inputSchema: {
      username: z.string()
        .min(3)
        .max(20)
        .describe('Username between 3-20 characters'),
      email: z.string()
        .email()
        .describe('Valid email address'),
      age: z.number()
        .min(13)
        .optional()
        .describe('User age (must be 13 or older)')
    }
  },
  async (params) => createUser(params)
);
```

### 3. Keep Tools Focused

```typescript
// ❌ Bad: Tool does too much
const megaTool = tool(
  {
    name: 'do_everything',
    description: 'Read files, write files, call APIs, send emails',
    inputSchema: { /* complex schema */ }
  },
  async (params) => { /* complex logic */ }
);

// ✅ Good: Separate, focused tools
const readFile = tool({ /* ... */ }, async () => { /* ... */ });
const writeFile = tool({ /* ... */ }, async () => { /* ... */ });
const callAPI = tool({ /* ... */ }, async () => { /* ... */ });
const sendEmail = tool({ /* ... */ }, async () => { /* ... */ });
```

### 4. Return Useful Data

```typescript
// ❌ Bad: Vague return value
const badTool = tool(
  {
    name: 'save',
    description: 'Save something',
    inputSchema: { data: z.unknown() }
  },
  async ({ data }) => {
    await save(data);
    return 'ok';  // Not helpful
  }
);

// ✅ Good: Detailed return value
const goodTool = tool(
  {
    name: 'save_document',
    description: 'Save a document to storage',
    inputSchema: {
      title: z.string(),
      content: z.string()
    }
  },
  async ({ title, content }) => {
    const doc = await saveDocument({ title, content });
    return {
      id: doc.id,
      title: doc.title,
      createdAt: doc.createdAt,
      url: doc.url
    };
  }
);
```

### 5. Handle Edge Cases

```typescript
const robustTool = tool(
  {
    name: 'fetch_data',
    description: 'Fetch data from URL',
    inputSchema: {
      url: z.string().url()
    }
  },
  async ({ url }) => {
    // Timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      // Check response
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      // Handle different content types
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout' };
      }
      return { success: false, error: error.message };
    } finally {
      clearTimeout(timeout);
    }
  }
);
```

## Common Patterns

### File Operations

```typescript
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

export const fileTools = {
  read: tool(
    {
      name: 'read_file',
      description: 'Read contents of a file',
      inputSchema: {
        path: z.string()
      }
    },
    async ({ path }) => await readFile(path, 'utf-8')
  ),
  
  write: tool(
    {
      name: 'write_file',
      description: 'Write contents to a file',
      inputSchema: {
        path: z.string(),
        content: z.string()
      }
    },
    async ({ path, content }) => {
      await writeFile(path, content, 'utf-8');
      return { success: true, path };
    }
  ),
  
  list: tool(
    {
      name: 'list_directory',
      description: 'List files in a directory',
      inputSchema: {
        path: z.string()
      }
    },
    async ({ path }) => {
      const files = await readdir(path);
      return files;
    }
  ),
  
  info: tool(
    {
      name: 'file_info',
      description: 'Get information about a file',
      inputSchema: {
        path: z.string()
      }
    },
    async ({ path }) => {
      const stats = await stat(path);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    }
  )
};
```

### API Calls

```typescript
const apiTool = tool(
  {
    name: 'github_api',
    description: 'Call GitHub API',
    inputSchema: {
      endpoint: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
      body: z.record(z.unknown()).optional()
    }
  },
  async ({ endpoint, method = 'GET', body }) => {
    const url = `https://api.github.com${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    return await response.json();
  }
);
```

### Database Operations

```typescript
import { db } from './database';

const dbTools = {
  query: tool(
    {
      name: 'db_query',
      description: 'Query database',
      inputSchema: {
        table: z.string(),
        where: z.record(z.unknown()).optional(),
        limit: z.number().optional()
      }
    },
    async ({ table, where, limit = 100 }) => {
      return await db.from(table).where(where).limit(limit);
    }
  ),
  
  insert: tool(
    {
      name: 'db_insert',
      description: 'Insert record into database',
      inputSchema: {
        table: z.string(),
        data: z.record(z.unknown())
      }
    },
    async ({ table, data }) => {
      const result = await db.into(table).insert(data);
      return { id: result[0], ...data };
    }
  )
};
```

### Calculation Tools

```typescript
const mathTools = {
  calculate: tool(
    {
      name: 'calculator',
      description: 'Perform mathematical operations',
      inputSchema: {
        operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt']),
        a: z.number(),
        b: z.number().optional()
      }
    },
    async ({ operation, a, b }) => {
      switch (operation) {
        case 'add': return a + (b ?? 0);
        case 'subtract': return a - (b ?? 0);
        case 'multiply': return a * (b ?? 1);
        case 'divide':
          if (b === 0) throw new Error('Division by zero');
          return a / (b ?? 1);
        case 'power': return Math.pow(a, b ?? 2);
        case 'sqrt': return Math.sqrt(a);
        default: throw new Error('Unknown operation');
      }
    }
  ),
  
  statistics: tool(
    {
      name: 'calculate_stats',
      description: 'Calculate statistics on numeric data',
      inputSchema: {
        data: z.array(z.number()),
        metrics: z.array(z.enum(['mean', 'median', 'sum', 'min', 'max', 'std']))
      }
    },
    async ({ data, metrics }) => {
      const stats: Record<string, number> = {};
      
      if (metrics.includes('sum')) {
        stats.sum = data.reduce((a, b) => a + b, 0);
      }
      if (metrics.includes('mean')) {
        stats.mean = stats.sum / data.length;
      }
      if (metrics.includes('min')) {
        stats.min = Math.min(...data);
      }
      if (metrics.includes('max')) {
        stats.max = Math.max(...data);
      }
      if (metrics.includes('median')) {
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        stats.median = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }
      
      return stats;
    }
  )
};
```

## Real-World Examples

### Web Scraper Tool

```typescript
import * as cheerio from 'cheerio';

const webScraperTool = tool(
  {
    name: 'scrape_webpage',
    description: 'Extract text content from a webpage',
    inputSchema: {
      url: z.string().url(),
      selector: z.string().optional()
    }
  },
  async ({ url, selector }) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    if (selector) {
      return $(selector).text();
    }
    
    return $('body').text();
  }
);
```

### Email Sender Tool

```typescript
import nodemailer from 'nodemailer';

const emailTool = tool(
  {
    name: 'send_email',
    description: 'Send an email',
    inputSchema: {
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
      from: z.string().email().optional()
    }
  },
  async ({ to, subject, body, from = 'noreply@example.com' }) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: body
    });
    
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  }
);
```

## Testing Tools

### Unit Testing

```typescript
import { describe, it, expect } from '@jest/globals';
import { tool } from '@agentage/sdk';
import { z } from 'zod';

describe('calculator tool', () => {
  const calculator = tool(
    {
      name: 'calculator',
      description: 'Calculate',
      inputSchema: {
        operation: z.enum(['add', 'subtract']),
        a: z.number(),
        b: z.number()
      }
    },
    async ({ operation, a, b }) => {
      if (operation === 'add') return a + b;
      return a - b;
    }
  );
  
  it('should add numbers', async () => {
    const result = await calculator.execute({
      operation: 'add',
      a: 5,
      b: 3
    });
    expect(result).toBe(8);
  });
  
  it('should subtract numbers', async () => {
    const result = await calculator.execute({
      operation: 'subtract',
      a: 10,
      b: 4
    });
    expect(result).toBe(6);
  });
});
```

### Mocking External Dependencies

```typescript
import { vi } from 'vitest';

describe('api tool', () => {
  it('should call API', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });
    
    const apiTool = tool(
      {
        name: 'api',
        description: 'Call API',
        inputSchema: { url: z.string() }
      },
      async ({ url }) => {
        const res = await fetch(url);
        return res.json();
      }
    );
    
    const result = await apiTool.execute({
      url: 'https://api.example.com'
    });
    
    expect(result).toEqual({ data: 'test' });
    expect(fetch).toHaveBeenCalledWith('https://api.example.com');
  });
});
```

---

## Next Steps

- [Advanced Usage](./advanced-usage.md) - Complex patterns
- [API Reference](./api-reference.md) - Complete API docs
- [Examples](../examples/) - Working code examples

---

**Ready to build tools?** Start with the [Getting Started Guide](./getting-started.md)!
