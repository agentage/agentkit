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
