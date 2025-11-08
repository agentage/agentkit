# AgentKit CLI

Command-line interface for creating and managing AI agents.

## Installation

Install globally:

```bash
npm install -g @agentage/cli
```

Or use with npx:

```bash
npx @agentage/cli <command>
```

## Quick Start

```bash
# Create a new agent
agent init my-assistant

# Run the agent
agent run my-assistant "Hello, how are you?"

# List all agents
agent list
```

## Commands

### `agent init [name]`

Create a new agent configuration file.

#### Synopsis

```bash
agent init [name]
```

#### Arguments

- `name` (optional): Name for the agent (default: `my-agent`)

#### Description

Creates a new agent YAML file in the `agents/` directory with a default template.

#### Examples

```bash
# Create agent with default name
agent init

# Create agent with custom name
agent init my-assistant

# Create specialized agents
agent init code-reviewer
agent init data-analyzer
agent init customer-support
```

#### Output

Creates `agents/<name>.yml`:

```yaml
name: my-assistant
model: gpt-4
instructions: |
  You are a helpful AI assistant.
  Respond clearly and concisely.
tools: []
variables: {}
```

---

### `agent run <name> [prompt]`

Execute an agent with a prompt.

#### Synopsis

```bash
agent run <name> [prompt]
```

#### Arguments

- `name` (required): Name of the agent to run
- `prompt` (optional): Message to send to agent (default: `"Hello!"`)

#### Description

Loads an agent configuration from `agents/<name>.yml` and executes it with the provided prompt. Requires `OPENAI_API_KEY` environment variable.

#### Examples

```bash
# Run with default prompt
agent run my-assistant

# Run with custom prompt
agent run my-assistant "What is TypeScript?"

# Run specialized agents
agent run data-analyzer "Analyze sales trends for Q4"
agent run customer-support "How do I reset my password?"
```

#### Environment Variables

- `OPENAI_API_KEY`: Required. Your OpenAI API key

```bash
export OPENAI_API_KEY='sk-...'
agent run my-assistant "Hello"
```

---

### `agent list`

List all available agents.

#### Synopsis

```bash
agent list
```

#### Description

Displays all agent configurations found in the `agents/` directory with their names and models.

#### Output

```bash
📋 Available Agents:

  ✅ my-assistant (gpt-4)
  ✅ code-reviewer (gpt-4)
  ✅ data-analyzer (gpt-3.5-turbo)
```

---

## Agent Configuration File

### File Format

Agent configurations use YAML format and must be placed in the `agents/` directory.

### File Structure

```yaml
name: agent-name
model: gpt-4
instructions: |
  Multi-line instructions
  for the agent
tools: []
variables: {}
```

### Example Configurations

#### Basic Assistant

```yaml
name: assistant
model: gpt-4
instructions: |
  You are a helpful AI assistant.
  Provide clear and accurate information.
tools: []
variables: {}
```

#### Code Reviewer

```yaml
name: code-reviewer
model: gpt-4
instructions: |
  You are an expert code reviewer.
  Review code for:
  - Bugs and errors
  - Security issues
  - Best practices
  - Performance concerns
  Provide specific, actionable feedback.
tools: []
variables: {}
```

#### Data Analyzer

```yaml
name: data-analyzer
model: gpt-4
instructions: |
  You are a data analysis expert.
  Analyze data to find:
  - Trends and patterns
  - Anomalies
  - Key insights
  - Actionable recommendations
  Present findings clearly with evidence.
tools: []
variables: {}
```

## Environment Setup

### Using .env File

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Using Environment Variables

**Linux/macOS:**
```bash
export OPENAI_API_KEY='sk-...'
```

**Windows (CMD):**
```cmd
set OPENAI_API_KEY=sk-...
```

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY='sk-...'
```

## Troubleshooting

### Issue: Command not found

**Solution:**
```bash
# Install globally
npm install -g @agentage/cli

# Or use npx
npx @agentage/cli init
```

### Issue: Agent not found

**Solution:**
```bash
# List available agents
agent list

# Create the agent first
agent init my-assistant
```

### Issue: API errors

**Solution:**
- Check API key is valid
- Verify internet connection
- Check OpenAI API status

## See Also

- [Agent Schema Reference](./docs/agent-schema.md)
- [SDK Documentation](../../docs/api-reference.md)
- [Getting Started Guide](../../docs/getting-started.md)

## Requirements

- Node.js 20+
- npm 10+
- OpenAI API key

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test

# Verify all
npm run verify
```

## License

MIT
