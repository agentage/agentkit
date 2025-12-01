# AgentKit - Development Instructions

## **Project Overview**

- AI agent framework and SDK - TypeScript monorepo
- Minimal interface definitions for building AI agents
- Core SDK package with builder and config patterns
- npm workspaces for package management

## **Project Agreements**

- Default branch: `master`
- Repository: `agentage/agentkit`
- Branch names: `feature/*`, `bugfix/*`, `hotfix/*`, `setup-*`
- Commits: `feat:`, `fix:`, `chore:` (max 72 chars)
- Verifications: `npm run verify` (type-check + lint + build + test)

## **Publishing**

- The packages are published to npm under the `@agentage` scope.
- Auto-publish on push to `master` when `package.json` version is bumped.

## **Release Strategy**

- 🎯 **MINIMAL FIRST**: Interface definitions only, no implementations
- 🚫 **No Over-Engineering**: Keep SDK under 100 LOC
- ⚡ **Essential Only**: Core types and interfaces

## **Rules**

- 📊 Use icons/tables for structured output
- 📁 NO extra docs unless explicitly asked
- 🐙 GitHub: owner `agentage`, repo `agentkit`
- ⚡ Prefer function calls over terminal commands
- 📦 Monorepo: All packages in `packages/*`

## **Coding Standards**

### TypeScript
- 🚫 No `any` type - explicit types always
- 📤 Named exports only (no default exports)
- 📏 SDK package <100 lines, files <200 lines
- 🔄 Functional: arrow functions, async/await, destructuring
- 🏗️ Interfaces over classes
- ✅ ESM modules (`type: "module"`)

### Naming

- **Interfaces**: `AgentConfig`, `AgentResponse`, `Tool`
- **Types**: `AgentFactory`, `CreateToolConfig`
- **Files**: `agent.types.ts`, `factory.types.ts`, `*.test.ts`

## **Tech Stack**

- **Language**: TypeScript 5.3+ (strict mode)
- **Module**: ESNext with ESM
- **Testing**: Jest 30+ with ts-jest
- **Linting**: ESLint 9+ (flat config)
- **Formatting**: Prettier
- **Package Manager**: npm (workspaces)

## **Node Requirements**

- Node.js >= 20.0.0
- npm >= 10.0.0

## **API Patterns**

Both patterns supported:

**Builder Pattern**:
```typescript
agent('name')
  .model('gpt-4', { temperature: 0.7 })
  .instructions('You are helpful')
  .tools([tool])
  .send('message')
```

**Config Object**:
```typescript
agent({ name: 'name', model: 'gpt-4', ... })
  .send('message')
```

## **Workspace Structure**

```
packages/
  sdk/              # @agentkit/sdk - Core interfaces
```

## **Scripts**

All packages support:

- `npm run build` - Build TypeScript
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint check
- `npm run lint:fix` - Auto-fix linting
- `npm run test` - Run Jest tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report
- `npm run verify` - All checks
- `npm run clean` - Clean build artifacts

## **Quality Gates**

- ✅ Type check must pass
- ✅ Linting must pass (no warnings)
- ✅ All tests must pass
- ✅ Coverage >= 70% (branches, functions, lines, statements)
- ✅ Build must succeed
