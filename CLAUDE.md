# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AgentKit** — AI agent framework and SDK for the Agentage platform. Provides core primitives (`@agentage/core`) and platform integration (`@agentage/platform`) for building and running AI agents.

**Repository:** `agentage/agentkit`
**Default Branch:** `master`
**Monorepo:** npm workspaces with TypeScript composite projects

## Development Commands

```bash
npm install              # Install all workspace dependencies
npm run build            # Build all packages
npm test                 # Run Vitest unit tests
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run format:check     # Prettier check
npm run verify           # Full pipeline: type-check + lint + build + test
npm run clean            # Clean build artifacts
```

## Architecture

### Packages

```
packages/
├── core/         # @agentage/core — Agent primitives, types, runtime
└── platform/     # @agentage/platform — Platform adapters, Supabase integration
```

### Build Order

`@agentage/core` → `@agentage/platform` (platform depends on core)

### Key Dependencies

- `@anthropic-ai/sdk` — Claude API integration
- TypeScript strict mode, ES2024 target, NodeNext modules

## Testing

- **Framework:** Vitest
- **Pattern:** `*.test.ts` colocated with source
- **Coverage:** 70% minimum threshold
- **Run:** `npm test` (all), `npm run test:watch` (dev)

## Standards

See [root CLAUDE.md](../../CLAUDE.md) and [agentage CLAUDE.md](../CLAUDE.md) for cross-repo conventions, branching strategy, and tech standards.
