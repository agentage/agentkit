# Contributing to AgentKit

Thank you for your interest in contributing to AgentKit! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- **Be respectful**: Treat all contributors with respect and professionalism
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together to improve the project

## Development Setup

### Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **Git**: Latest version

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/agentage/agentkit.git
cd agentkit

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Verify Your Setup

```bash
# Run all quality checks (type-check + lint + build + test)
npm run verify
```

This command must pass before submitting a pull request.

## Code Standards

AgentKit follows strict coding standards for consistency and quality.

### TypeScript Standards

- ✅ **Strict mode**: Always use TypeScript strict mode
- ✅ **Named exports**: Use named exports only (no default exports)
- ❌ **No `any` type**: Use explicit types always
- ✅ **Functions over classes**: Prefer functions for logic
- ✅ **Async/await**: Use async/await over promises
- ✅ **Destructuring**: Use object/array destructuring
- ✅ **Interfaces over classes**: Define contracts with interfaces
- ✅ **ESM modules**: Use `type: "module"` in package.json

### File Size Limits

- **SDK package**: Max 100 lines total
- **Regular files**: Max 200 lines per file
- **Functions**: Max 20 lines per function
- **Split large files**: Break into smaller, focused modules

### Naming Conventions

#### Interfaces
```typescript
// ✅ Correct
export interface AgentConfig { }
export interface AgentResponse { }
export interface Tool { }
```

#### Types
```typescript
// ✅ Correct
export type AgentFactory = () => Agent;
export type CreateToolConfig = { };
```

#### Files
```typescript
// ✅ Correct
agent.types.ts
factory.types.ts
agent.test.ts
index.ts
```

### Code Examples

#### ✅ Good Example
```typescript
import { z } from 'zod';

export interface ToolConfig {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: z.ZodObject<unknown>;
}

export const createTool = async (
  config: ToolConfig
): Promise<Tool> => {
  const { name, description, inputSchema } = config;
  
  return {
    name,
    description,
    execute: async (input: unknown) => {
      const validated = inputSchema.parse(input);
      return validated;
    }
  };
};
```

#### ❌ Bad Example
```typescript
// Default export - not allowed
export default class ToolFactory {
  // Classes for logic - prefer functions
  
  constructor(private config: any) { // 'any' type - not allowed
    // Constructor logic
  }
  
  public createTool() { // Missing return type
    return new Promise((resolve, reject) => { // Use async/await
      // Promise logic
    });
  }
}
```

## Project Structure

```
agentkit/                    # Monorepo root
├── packages/                # All packages
│   ├── sdk/                 # @agentage/sdk - Core SDK
│   ├── core/                # @agentage/core - Core types
│   └── model-openai/        # @agentage/model-openai - OpenAI adapter
├── examples/                # Example projects
├── docs/                    # Documentation
├── package.json             # Root package.json (workspaces)
├── tsconfig.json            # Root TypeScript config
├── eslint.config.js         # Root ESLint config
└── jest.config.js           # Root Jest config
```

### Package Dependencies

- **sdk** → depends on **core**
- **model-openai** → depends on **core**

## Making Changes

### 1. Create a Feature Branch

Branch naming conventions:
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes
- `setup-*` - Setup/configuration changes

```bash
# Create and checkout branch
git checkout -b feature/add-tool-validation
```

### 2. Write Code

Follow the code standards above and ensure:
- Code is well-commented
- Logic is clear and simple
- Files are properly structured
- Types are explicit

### 3. Add Tests

All new code requires tests:

```typescript
// Example test file: agent.test.ts
import { describe, it, expect } from '@jest/globals';
import { agent } from './agent';

describe('agent', () => {
  it('should create agent with name', () => {
    const myAgent = agent('test-agent');
    expect(myAgent).toBeDefined();
  });
  
  it('should set model correctly', () => {
    const myAgent = agent('test').model('gpt-4');
    expect(myAgent).toBeDefined();
  });
});
```

### 4. Update Documentation

- Update README if user-facing changes
- Update API docs if signature changes
- Add examples for new features
- Update CHANGELOG.md

### 5. Run Verification

```bash
# Run all checks
npm run verify
```

This runs:
- Type checking (`npm run type-check`)
- Linting (`npm run lint`)
- Build (`npm run build`)
- Tests (`npm test`)

All must pass before submitting PR.

## Pull Request Process

### 1. Prepare Your PR

```bash
# Ensure your branch is up to date
git checkout master
git pull origin master
git checkout feature/your-feature
git rebase master

# Run verification one final time
npm run verify
```

### 2. Create Pull Request

**PR Title Format**:
```
type: brief description

Examples:
feat: add tool validation
fix: resolve agent execution error
docs: update API reference
```

**PR Description Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] `npm run verify` passes
- [ ] No breaking changes (or documented)
```

### 3. Review Process

- Maintainers will review your PR
- Address feedback promptly
- Keep discussions constructive
- Update PR as requested

### 4. Merge

Once approved:
- PR will be merged by maintainers
- Branch will be deleted
- Changes will appear in next release

## Testing Requirements

### Coverage Requirements

- **New features**: >80% coverage
- **Bug fixes**: Add tests reproducing the bug
- **Overall project**: Maintain >70% coverage

### Test Types

#### Unit Tests
Test individual functions/modules:
```typescript
describe('createTool', () => {
  it('should create tool with valid config', () => {
    const tool = createTool({
      name: 'test',
      description: 'Test tool',
      inputSchema: z.object({})
    });
    expect(tool).toBeDefined();
  });
});
```

#### Integration Tests
Test component interactions:
```typescript
describe('agent with tools', () => {
  it('should execute tool when requested', async () => {
    const tool = createTool({ /* config */ });
    const myAgent = agent('test').tools([tool]);
    const result = await myAgent.send('use the tool');
    expect(result).toBeDefined();
  });
});
```

## Commit Messages

Follow conventional commit format:

### Format
```
type: description

Examples:
feat: add streaming support
fix: resolve memory leak in agent
docs: update getting started guide
refactor: simplify tool creation
test: add integration tests for CLI
chore: update dependencies
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Guidelines
- **Max 72 characters** for first line
- Use **imperative mood**: "add" not "added"
- Be **specific and clear**
- Reference issues: `fix: resolve #123`

### Examples

```bash
# Good commits
git commit -m "feat: add tool validation with zod schemas"
git commit -m "fix: resolve agent execution timeout issue"
git commit -m "docs: add migration guide for v0.2.0"

# Bad commits
git commit -m "fixed stuff"           # Too vague
git commit -m "Added new feature"      # Not imperative
git commit -m "WIP"                    # Not descriptive
```

## Documentation

### When to Update Documentation

- **API changes**: Update API reference
- **New features**: Add to getting started or examples
- **Breaking changes**: Update migration guide
- **Bug fixes**: May need troubleshooting updates

### Documentation Files

- `README.md` - Project overview and quick start
- `CONTRIBUTING.md` - This file
- `CHANGELOG.md` - Version history
- `docs/` - Detailed documentation
- Package READMEs - Package-specific docs

## Release Process

Releases are managed by maintainers following this process:

### Versioning

We use [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version** in package.json files
2. **Update CHANGELOG.md** with changes
3. **Create git tag**: `git tag -a v1.2.3 -m "Release v1.2.3"`
4. **Push tag**: `git push origin v1.2.3`
5. **Create GitHub release** with notes
6. **Publish to npm**: `npm publish`

## Getting Help

### Resources

- **Documentation**: [docs/](./docs/)
- **Examples**: [examples/](./examples/)
- **API Reference**: [docs/api-reference.md](./docs/api-reference.md)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/agentage/agentkit/issues)
- **GitHub Discussions**: [Ask questions or discuss ideas](https://github.com/agentage/agentkit/discussions)

### Contact

For security issues, please email: security@agentage.dev

---

Thank you for contributing to AgentKit! 🚀
