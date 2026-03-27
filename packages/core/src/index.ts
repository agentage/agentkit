// Types
export type {
  JsonSchema,
  AgentManifest,
  AgentProcess,
  Agent,
  AgentConfig,
  AgentFactory,
  RunState,
  RunInput,
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
export { agent } from './agent.js';

// Event helpers
export { output, progress, error, result } from './events.js';

// Builders
export { tool } from './tool.js';
export { mcp } from './mcp.js';

// Adapters
export { shell, claude, copilot } from './adapters/index.js';
export type { ClaudeOptions, CopilotOptions } from './adapters/index.js';
