# Changelog

All notable changes to Agentage AgentKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [platform@0.6.1] - 2026-04-22

### New Features
- Add CPU count and load average metrics to agent heartbeat monitoring

## [platform@0.6.0] - 2026-04-22

### New Features
- Add disk usage monitoring to agent heartbeat system for better resource tracking

## [core@0.10.0] - 2026-04-19

### New Features
- Add control-plane action registry for host-UI dispatch in core package

## [core@0.9.0+platform@0.5.0] - 2026-04-15

### New Features
- Add sequence, parallel, and map combinators for composing agent operations
- Add PAT_TOKEN fallback configuration for automated release merging

## [core@0.8.0+platform@0.4.0] - 2026-04-15

### New Features
- Add `ctx.run()` primitive for executing agent operations
- Add `AgentRegistry` for managing agent instances
- Add `defineAgent()` Zod helper for improved agent definition
- Add `manifest.outputSchema` support for structured agent outputs
- Add comprehensive testing fixtures for agent development

## [core@0.7.0+platform@0.3.0] - 2026-04-15

### New Features
- Add `defineAgent()` Zod helper for easier agent definition with schema validation
- Add `manifest.outputSchema` support for defining agent output schemas

## [core@0.6.0] - 2026-04-09

### New Features
- Add ProjectRef type to RunInput for better project reference handling
- Add automated release workflow with pull request validation and auto-merge capabilities

### Improvements
- Enhance PR validation with in-progress status comments
- Standardize release PR body format to match desktop application style
- Align PR validation comment format with desktop/CLI style consistency

### Bug Fixes
- Fix release gate pattern handling for squash merge operations
- Remove [skip ci] directive from release preparation commits

