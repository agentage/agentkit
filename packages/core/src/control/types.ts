import type { JsonSchema } from '../types.js';

export type ActionScope = 'machine' | 'hub' | 'project';

export interface ActionManifest {
  name: `${string}:${string}`;
  version: string;
  title: string;
  description: string;
  scope: ActionScope;
  capability: string;
  idempotent: boolean;
  inputSchema?: JsonSchema;
  outputSchema?: JsonSchema;
  progressSchema?: JsonSchema;
  deprecatedSince?: string;
}

export interface ActionLogger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface ActionContext {
  invocationId: string;
  callerId: string;
  capabilities: ReadonlySet<string>;
  idempotencyKey?: string;
  signal: AbortSignal;
  logger?: ActionLogger;
}

export interface ActionDefinition<I = unknown, O = unknown, P = unknown> {
  manifest: ActionManifest;
  execute(ctx: ActionContext, input: I): AsyncGenerator<P, O, void>;
  validateInput?(input: unknown): I;
}

export interface InvokeRequest {
  action: string;
  version?: string;
  input: unknown;
  idempotencyKey?: string;
  callerId: string;
  capabilities: string[];
}

export type InvokeEvent =
  | { type: 'accepted'; invocationId: string }
  | { type: 'progress'; data: unknown }
  | { type: 'result'; data: unknown }
  | { type: 'error'; code: ActionErrorCode; message: string; retryable: boolean };

export type ActionErrorCode =
  | 'UNKNOWN_ACTION'
  | 'UNKNOWN_VERSION'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'DEPRECATED'
  | 'DUPLICATE_INVOCATION'
  | 'EXECUTION_FAILED'
  | 'CANCELED';

export interface ActionRegistry {
  register<I, O, P>(def: ActionDefinition<I, O, P>): void;
  list(): ActionManifest[];
  get(name: string, version?: string): ActionDefinition | undefined;
  invoke(req: InvokeRequest, signal?: AbortSignal): AsyncGenerator<InvokeEvent>;
}
