# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation for SDK, CLI, and packages
- CONTRIBUTING.md with development guidelines
- Complete API reference documentation
- Getting started guide for new users
- Tool development guide
- Advanced usage patterns documentation

### Changed
- Enhanced README with more examples and troubleshooting

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Nothing yet

### Security
- Nothing yet

## [0.1.2] - 2024-11-08

### Added
- CLI: `agent init` command for creating new agent definitions
- CLI: `agent run` command for executing agents from YAML files
- CLI: `agent list` command for viewing available agents
- CLI: YAML parser for agent definitions with schema validation
- Examples: Basic SDK example demonstrating agent creation
- Examples: Tool example with calculator implementation
- SDK: Error classes for better error handling
- Core: Result types for agent execution outcomes

### Changed
- Updated TypeScript to 5.9.3
- Improved error messages in CLI commands
- Enhanced tool execution with better error context
- Standardized naming conventions across packages

### Fixed
- Fixed agent.yml parsing with empty tools array
- Resolved model configuration merging issues
- Fixed tool schema validation edge cases

## [0.1.1] - 2024-11-07

### Added
- SDK: Builder pattern API for agent creation
- SDK: Config object pattern as alternative to builder
- SDK: Tool execution with Zod schema validation
- SDK: Model configuration with temperature and token limits
- Core: Tool types and interfaces
- Core: Message types for agent communication
- Documentation: Basic README for each package

### Changed
- Simplified agent creation API
- Improved type safety across all packages
- Enhanced tool definition interface

### Fixed
- Tool input validation error handling
- Model provider configuration issues

## [0.1.0] - 2024-11-06

### Added
- Initial release of AgentKit
- Core: Type definitions for agents, tools, models, and messages
- Core: Interface definitions for model providers
- Core: Configuration types
- SDK: Core agent factory function
- SDK: Tool creation utilities
- Model OpenAI: OpenAI model adapter implementation
- Model OpenAI: GPT-3.5 and GPT-4 support
- Model OpenAI: Function calling support for tools
- Monorepo structure with npm workspaces
- TypeScript 5.3+ support with strict mode
- ESLint configuration with flat config
- Jest configuration for testing
- Basic examples and documentation

### Infrastructure
- npm workspaces for package management
- Shared TypeScript configuration
- Shared ESLint configuration
- Shared Jest configuration
- CI/CD setup (to be configured)

[Unreleased]: https://github.com/agentage/agentkit/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/agentage/agentkit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/agentage/agentkit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/agentage/agentkit/releases/tag/v0.1.0
