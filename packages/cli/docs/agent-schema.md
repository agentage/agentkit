# Agent YAML Schema Reference

Complete reference for agent configuration files.

## Overview

Agent configuration files use YAML format and define how an agent behaves, what model it uses, and what tools it has access to.

## Schema

### Complete Schema Definition

```yaml
name: string              # Required - Agent identifier
model: string             # Required - Model name
instructions: string      # Required - System prompt
tools: array<string>      # Optional - Tool names (default: [])
variables: object         # Optional - Key-value pairs (default: {})
```

## Fields

### `name`

**Type**: `string`  
**Required**: Yes  
**Description**: Unique identifier for the agent

**Rules**:
- Must be at least 1 character
- Used as filename (without `.yml` extension)
- Should be descriptive and kebab-case

**Examples**:

```yaml
# ✅ Good
name: code-reviewer
name: data-analyzer
name: customer-support

# ❌ Bad
name: ""           # Empty string
name: agent1       # Not descriptive
name: Code Reviewer # Spaces (use kebab-case)
```

---

### `model`

**Type**: `string`  
**Required**: No (default: `gpt-4`)  
**Description**: The AI model to use for this agent

**Supported Values**:
- `gpt-4` - GPT-4 (recommended for complex tasks)
- `gpt-3.5-turbo` - GPT-3.5 Turbo (faster, cheaper, good for simple tasks)

**Examples**:

```yaml
# Use GPT-4 (default)
model: gpt-4

# Use GPT-3.5 Turbo
model: gpt-3.5-turbo
```

**Notes**:
- Advanced model configuration (temperature, max_tokens) not currently supported in YAML
- Use the SDK for advanced model configuration

---

### `instructions`

**Type**: `string` (multi-line)  
**Required**: Yes  
**Description**: System prompt that defines the agent's behavior, personality, and capabilities

**Rules**:
- Must be at least 1 character
- Use `|` for multi-line strings
- Be specific and clear
- Define the agent's role and constraints

**Examples**:

#### Basic Assistant

```yaml
instructions: |
  You are a helpful AI assistant.
  Respond clearly and concisely.
```

#### Specialized Agent

```yaml
instructions: |
  You are an expert code reviewer specializing in TypeScript.
  
  Your responsibilities:
  - Review code for bugs and errors
  - Identify security vulnerabilities
  - Suggest performance improvements
  - Ensure best practices are followed
  
  Guidelines:
  - Be specific and actionable
  - Provide code examples when helpful
  - Explain the reasoning behind suggestions
  - Prioritize critical issues
```

#### Multi-persona Agent

```yaml
instructions: |
  You are a data analyst with expertise in:
  - Statistical analysis
  - Data visualization
  - Trend identification
  - Business intelligence
  
  When analyzing data:
  1. Identify patterns and trends
  2. Note any anomalies
  3. Provide actionable insights
  4. Support findings with evidence
  
  Present results in a clear, structured format.
```

**Best Practices**:

```yaml
# ✅ Good - Specific and detailed
instructions: |
  You are a customer support agent for TechCo.
  
  Your goal: Resolve customer issues efficiently and professionally.
  
  Approach:
  1. Greet the customer warmly
  2. Listen carefully to their concern
  3. Ask clarifying questions if needed
  4. Provide clear, step-by-step solutions
  5. Confirm the issue is resolved
  
  Tone: Friendly, patient, professional
  Response length: Concise but complete

# ❌ Bad - Too vague
instructions: Help customers
```

---

### `tools`

**Type**: `array<string>`  
**Required**: No (default: `[]`)  
**Description**: List of tool names the agent can use

**Current Status**: **Not yet implemented**  
**Planned**: Future release will support tool integration

**Example** (future):

```yaml
tools:
  - read_file
  - write_file
  - search_web
  - send_email
```

**Current Usage**:

```yaml
# Leave empty for now
tools: []
```

---

### `variables`

**Type**: `object` (key-value pairs)  
**Required**: No (default: `{}`)  
**Description**: Custom variables for the agent configuration

**Current Status**: **Defined but not actively used**  
**Planned**: Future support for variable substitution in instructions

**Example** (future):

```yaml
variables:
  company_name: "Acme Corp"
  support_email: "support@acme.com"
  product_name: "Widget Pro"
  
instructions: |
  You are a support agent for {{company_name}}.
  Our product is {{product_name}}.
  Direct urgent issues to {{support_email}}.
```

**Current Usage**:

```yaml
# Can define but won't be used yet
variables: {}
```

## Complete Examples

### Example 1: General Assistant

```yaml
name: assistant
model: gpt-4
instructions: |
  You are a helpful AI assistant.
  Provide accurate, clear, and concise responses.
  If you don't know something, say so.
tools: []
variables: {}
```

### Example 2: Code Reviewer

```yaml
name: code-reviewer
model: gpt-4
instructions: |
  You are an expert code reviewer.
  
  Focus areas:
  - Code quality and readability
  - Potential bugs and errors
  - Security vulnerabilities
  - Performance issues
  - Best practices adherence
  
  For each issue found:
  1. Describe the problem
  2. Explain why it's problematic
  3. Suggest a solution with example code
  
  Be constructive and educational.
tools: []
variables: {}
```

### Example 3: Documentation Writer

```yaml
name: doc-writer
model: gpt-4
instructions: |
  You are a technical documentation specialist.
  
  Your task: Create clear, comprehensive documentation.
  
  Documentation should include:
  - Purpose and overview
  - Prerequisites
  - Step-by-step instructions
  - Code examples with comments
  - Common issues and solutions
  - Related resources
  
  Writing style:
  - Clear and concise
  - Beginner-friendly
  - Well-structured with headings
  - Use markdown formatting
tools: []
variables: {}
```

### Example 4: Data Analyst

```yaml
name: data-analyst
model: gpt-4
instructions: |
  You are a senior data analyst.
  
  Analysis approach:
  1. Understand the data context
  2. Identify key metrics and patterns
  3. Note any anomalies or outliers
  4. Determine correlations and trends
  5. Provide actionable insights
  
  Presentation:
  - Start with executive summary
  - Support findings with data
  - Use clear visualizations (describe them)
  - Prioritize business impact
  - Include recommendations
tools: []
variables: {}
```

### Example 5: Customer Support

```yaml
name: customer-support
model: gpt-3.5-turbo
instructions: |
  You are a customer support representative.
  
  Your mission: Help customers quickly and effectively.
  
  Process:
  1. Greet professionally
  2. Understand the issue
  3. Provide clear solution
  4. Verify satisfaction
  5. Offer additional help
  
  Tone: Friendly, empathetic, patient
  Style: Clear, step-by-step instructions
  
  For complex issues:
  - Break down into simple steps
  - Use analogies when helpful
  - Confirm understanding at each step
tools: []
variables:
  company: "TechCo"
  support_hours: "24/7"
```

### Example 6: Language Translator

```yaml
name: translator
model: gpt-4
instructions: |
  You are a professional translator.
  
  Translation guidelines:
  - Preserve original meaning and tone
  - Adapt idioms and cultural references
  - Maintain formatting and structure
  - Note when direct translation isn't possible
  
  Always specify:
  - Source language
  - Target language
  - Any important context
tools: []
variables: {}
```

## Validation

The CLI validates agent configurations using the following Zod schema:

```typescript
const agentYamlSchema = z.object({
  name: z.string().min(1),
  model: z.string().default('gpt-4'),
  instructions: z.string().min(1),
  tools: z.array(z.string()).optional().default([]),
  variables: z.record(z.string()).optional().default({})
});
```

### Validation Errors

**Missing required field:**

```yaml
# ❌ Error: Missing 'name'
model: gpt-4
instructions: "Help users"
```

**Empty required field:**

```yaml
# ❌ Error: 'name' must be at least 1 character
name: ""
model: gpt-4
instructions: "Help users"
```

**Invalid type:**

```yaml
# ❌ Error: 'tools' must be an array
name: my-agent
model: gpt-4
instructions: "Help users"
tools: "read_file"  # Should be array: ["read_file"]
```

## File Location

Agent configuration files must be placed in the `agents/` directory:

```
project/
├── agents/
│   ├── assistant.yml
│   ├── code-reviewer.yml
│   └── data-analyzer.yml
└── ...
```

## Filename Convention

- **Format**: `<name>.yml`
- **Extension**: Must be `.yml` (not `.yaml`)
- **Name**: Should match the `name` field in the file
- **Case**: Use kebab-case

**Examples**:

```bash
# ✅ Good
agents/assistant.yml
agents/code-reviewer.yml
agents/data-analyzer.yml

# ❌ Bad
agents/assistant.yaml      # Wrong extension
agents/Code-Reviewer.yml   # Wrong case
agents/my agent.yml        # Spaces
```

## Testing Your Configuration

Test your agent configuration:

```bash
# Create agent
agent init test-agent

# Edit agents/test-agent.yml
# ...

# Test it
agent run test-agent "test prompt"
```

## Tips

### 1. Start Simple

```yaml
name: simple-agent
model: gpt-4
instructions: |
  You are a helpful assistant.
tools: []
variables: {}
```

Then iterate and refine.

### 2. Be Specific

```yaml
# ✅ Better
instructions: |
  You are a Python expert.
  Help developers debug code by:
  1. Analyzing error messages
  2. Identifying the root cause
  3. Suggesting fixes with examples

# ❌ Worse
instructions: Help with Python
```

### 3. Use Examples in Instructions

```yaml
instructions: |
  You are a code formatter.
  
  Example input:
  function add(a,b){return a+b}
  
  Example output:
  function add(a, b) {
    return a + b;
  }
  
  Apply proper formatting to all code.
```

### 4. Test Variations

Try different models and instructions to find what works best:

```bash
# Test with GPT-4
model: gpt-4

# Test with GPT-3.5 (faster/cheaper)
model: gpt-3.5-turbo
```

## See Also

- [CLI Documentation](../README.md)
- [Getting Started Guide](../../../docs/getting-started.md)
- [API Reference](../../../docs/api-reference.md)

---

**Questions?** Open a [discussion](https://github.com/agentage/agentkit/discussions).
