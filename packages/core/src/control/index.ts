/**
 * @experimental Control-plane action registry.
 *
 * The shape of `ActionManifest`, `InvokeEvent`, the error union, and the
 * registry surface are NOT covered by SemVer until a host-UI consumer
 * (CLI daemon, dashboard, desktop, MCP facade) lands and exercises them
 * end-to-end. Expect breaking changes between minor versions until then.
 *
 * Tracking: see work/tasks/feature-stabilization (NOT TESTED tier).
 */
export { action } from './action.js';
export { createRegistry } from './registry.js';
export { ActionError, isActionError } from './errors.js';
export type {
  ActionContext,
  ActionDefinition,
  ActionErrorCode,
  ActionLogger,
  ActionManifest,
  ActionRegistry,
  ActionScope,
  InvokeEvent,
  InvokeRequest,
} from './types.js';

// Reference actions — factories that bind to an injected shell. Host wires these in.
export {
  createCliUpdateAction,
  createProjectAddFromOriginAction,
  createAgentInstallAction,
} from './actions/index.js';
export type {
  ActionProgress,
  AgentInstallInput,
  AgentInstallOutput,
  CliUpdateInput,
  CliUpdateOutput,
  ProjectAddInput,
  ProjectAddOutput,
  ShellExec,
} from './actions/index.js';
