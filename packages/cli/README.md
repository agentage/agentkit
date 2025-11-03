# @agentage/cli

> CLI tool for creating and running AI agents locally

**Status**: MVP Phase - Core functionality only

## About

AgentKit CLI lets you define AI agents in simple configuration files and run them from your terminal. Create specialized agents for code review, documentation, testing, or any task—then execute them with a single command.

Each agent is just a file (YAML, JSON, or Markdown) with a name, model, and instructions. No complex setup, no boilerplate code.

## Installation

```bash
npm install -g @agentage/cli
```

## Usage

### Create an agent

```bash
agentkit init my-agent
```

### Run an agent

```bash
agentkit run my-agent "Your prompt here"
```

### List local agents

```bash
agentkit list
```

## Agent Definition

Agents can be defined in multiple formats. All require three fields: **name**, **description**, and **model**.

**YAML** (`agent.yml`):

```yaml
name: my-agent
description: A helpful assistant for code review
model: gpt-4
instructions: |
  You are a helpful assistant that...
```

**JSON** (`agent.json`):

```json
{
  "name": "my-agent",
  "description": "A helpful assistant for code review",
  "model": "gpt-4",
  "instructions": "You are a helpful assistant that..."
}
```

**Markdown** (`agent.md`):

```markdown
---
name: "my-agent"
description: "A helpful assistant for code review"
model: "gpt-4"
---

# Agent

You are a helpful assistant that...
```

## Requirements

- Node.js 20+
- npm 10+
- OpenAI API key (set `OPENAI_API_KEY` environment variable)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run type-check

# Verify all
npm run verify

# Clean
npm run clean
```

## License

MIT
