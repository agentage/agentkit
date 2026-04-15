/** JSON Schema (Draft 7) */
export type JsonSchema = Record<string, unknown>;

/** Metadata for discovery and display. */
export interface AgentManifest {
  /** Unique identifier (kebab-case) */
  name: string;

  /** Human-readable description */
  description?: string;

  /** Semver version */
  version?: string;

  /** Tags for filtering/search */
  tags?: string[];

  /** JSON Schema for structured input this agent accepts (beyond plain text) */
  inputSchema?: JsonSchema;

  /** JSON Schema describing the shape of `result.data` emitted by this agent */
  outputSchema?: JsonSchema;

  /** The source path this agent was loaded from */
  path: string;

  /**
   * Adapter-specific configuration.
   * Core passes through, doesn't interpret.
   * Examples: { model, temperature } for LLM, { image } for Docker, { command } for process.
   */
  config?: Record<string, unknown>;
}

/** A running agent process */
export interface AgentProcess {
  /** Unique run ID */
  runId: string;

  /** Async iterator of events — the primary output channel */
  events: AsyncIterable<RunEvent>;

  /** Cancel execution */
  cancel(): void;

  /** Provide input to a waiting agent (when state = input_required) */
  sendInput(input: string): void;
}

/** The full agent — metadata + ability to run. Constructed from a path by a factory. */
export interface Agent {
  /** Metadata for discovery and display */
  manifest: AgentManifest;

  /**
   * Execute this agent.
   * @param input - task, config overrides, context
   * @returns a running process with event stream
   */
  run(input: RunInput): Promise<AgentProcess>;
}

/**
 * Given a path, try to construct an Agent.
 * Return null if this factory doesn't handle this path.
 *
 * This is the only thing you implement to add a new agent type.
 */
export type AgentFactory = (path: string) => Promise<Agent | null>;

/**
 * Run states:
 *
 *   submitted -> working -> completed
 *                        -> failed
 *                        -> canceled
 *              working <-> input_required
 */
export type RunState =
  | 'submitted'
  | 'working'
  | 'input_required'
  | 'completed'
  | 'failed'
  | 'canceled';

/** Context passed to agent run functions */
export interface RunContext {
  /** AbortSignal for cancellation — wired from AgentProcess.cancel() */
  signal: AbortSignal;

  /** Abort-aware delay — resolves early (without throwing) if cancelled */
  sleep: (ms: number) => Promise<void>;
}

/** Project context passed to agent runs */
export interface ProjectRef {
  /** Project name (from package.json or directory name) */
  name: string;
  /** Absolute path to the project root (or worktree) */
  path: string;
  /** Git branch name (set when targeting a specific worktree) */
  branch?: string;
  /** Git remote URL (set when project was cloned from a remote) */
  remote?: string;
}

/** Input to an agent run */
export interface RunInput {
  /** The task/prompt — what the agent should do */
  task: string;

  /** Per-run config overrides (factory-specific) */
  config?: Record<string, unknown>;

  /** Additional context (file paths, text, URLs — agent decides how to use) */
  context?: string[];

  /** Project context (set when run is scoped to a project) */
  project?: ProjectRef;
}

/** Execution record */
export interface Run {
  /** Unique run ID */
  id: string;

  /** Agent name */
  agentName: string;

  /** The task/prompt */
  input: string;

  /** Current state */
  state: RunState;

  /** Error message (if state = failed) */
  error?: string;

  /**
   * Factory-specific stats.
   * Core doesn't interpret — factories put what they need.
   * Examples: { tokensIn, tokensOut } for LLM, { durationMs } for process, { exitCode } for docker.
   */
  stats?: Record<string, unknown>;

  /** Timestamps (Unix ms) */
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

/**
 * 5 generic event types — the minimum any agent needs.
 * Factories add richness through the `output` event's content + format.
 */
export type RunEventType = 'output' | 'state' | 'error' | 'input_required' | 'result';

/**
 * Event payloads — discriminated union.
 *
 * `output` is the generic channel — factories put anything in `content`,
 * and use `format` to tell consumers how to render it.
 */
export type RunEventData =
  | { type: 'output'; content: unknown; format?: string }
  | { type: 'state'; state: RunState; message?: string }
  | { type: 'error'; code: string; message: string; recoverable: boolean }
  | { type: 'input_required'; prompt: string; schema?: JsonSchema }
  | { type: 'result'; success: boolean; output?: unknown };

/** A single event in the run stream */
export interface RunEvent {
  type: RunEventType;
  data: RunEventData;
  timestamp: number;
}

// ─── Agent API v2 types ─────────────────────────────────────

/** Configuration for the agent() builder */
export interface AgentConfig {
  /** Agent name (inferred from filename if omitted) */
  name?: string;
  /** Human-readable description */
  description?: string;
  /** Semver version */
  version?: string;
  /** Tags for filtering/search */
  tags?: string[];
  /** JSON Schema for structured input */
  inputSchema?: JsonSchema;
  /** JSON Schema describing the shape of `result.data` emitted by this agent */
  outputSchema?: JsonSchema;

  // Declarative LLM mode (no run function needed)
  /** LLM model ID */
  model?: string;
  /** System prompt */
  prompt?: string;
  /** Built-in tool names or Tool objects */
  tools?: (string | Tool)[];
  /** MCP server configs */
  mcp?: McpServer[];
  /** LLM temperature */
  temperature?: number;
  /** Max LLM turns */
  maxTurns?: number;

  /** Custom run function — overrides declarative mode */
  run?: (input: RunInput, ctx: RunContext) => AsyncIterable<RunEvent>;
}

/** Custom tool definition */
export interface Tool {
  name: string;
  description: string;
  input: unknown;
  execute(args: unknown): Promise<unknown> | unknown;
}

/** MCP server configuration */
export interface McpServer {
  name: string;
  type?: 'stdio' | 'http' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}
