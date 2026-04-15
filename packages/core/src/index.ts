// Types
export type {
  JsonSchema,
  AgentManifest,
  AgentProcess,
  Agent,
  AgentConfig,
  AgentFactory,
  AgentRuntime,
  AgentRegistry,
  CtxRunFn,
  CtxRunResult,
  RunState,
  RunInput,
  ProjectRef,
  RunContext,
  Run,
  RunEventType,
  RunEventData,
  RunEvent,
  Tool,
  McpServer,
} from './types.js';

// Constants
export { TERMINAL_STATES, STATE_TRANSITIONS, OUTPUT_FORMATS } from './constants.js';

// State machine
export { isTerminal, canTransition } from './state-machine.js';

// Agent builder
export { agent, makeCtxRun, DEFAULT_DEPTH_LIMIT } from './agent.js';

// Composition combinators
export { sequence, parallel, map } from './combinators/index.js';
export type { StepRef, MapFactory } from './combinators/index.js';

// Event helpers
export { output, progress, error, result } from './events.js';

// Builders
export { tool } from './tool.js';
export { mcp } from './mcp.js';

// Adapters
export { shell, claude, copilot } from './adapters/index.js';
export type { ClaudeOptions, CopilotOptions } from './adapters/index.js';

// Note: the `defineAgent` Zod helper lives at `@agentage/core/zod` (subpath export).
// Import from there when you have `zod >= 4` installed as a peer.
