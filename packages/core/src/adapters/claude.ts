import type { RunEvent } from '../types.js';
import { output, error as errorEvent, result } from '../events.js';

/** Options for the Claude Agent SDK adapter */
export interface ClaudeOptions {
  signal?: AbortSignal;
  tools?: string[];
  maxTurns?: number;
  model?: string;
  systemPrompt?: string;
  mcpServers?: Record<string, unknown>;
  agents?: Record<string, unknown>;
  permissionMode?: string;
}

// Shapes expected from dynamic import of @anthropic-ai/claude-agent-sdk
interface SdkContentBlock {
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
}

interface SdkMessage {
  type: string;
  subtype?: string;
  message?: { content?: SdkContentBlock[] };
  result?: unknown;
}

/** Run a task using the Claude Agent SDK (dynamic import) */
export async function* claude(prompt: string, options?: ClaudeOptions): AsyncGenerator<RunEvent> {
  if (!process.env['ANTHROPIC_API_KEY']) {
    yield errorEvent('MISSING_API_KEY', 'ANTHROPIC_API_KEY environment variable is not set');
    yield result(false, 'ANTHROPIC_API_KEY not set');
    return;
  }

  let queryFn: (params: {
    prompt: string;
    options?: Record<string, unknown>;
  }) => AsyncIterable<SdkMessage>;

  try {
    const specifier = '@anthropic-ai/claude-agent-sdk';
    const sdk = (await import(specifier)) as { query: typeof queryFn };
    queryFn = sdk.query;
  } catch {
    yield errorEvent(
      'MISSING_SDK',
      'Install @anthropic-ai/claude-agent-sdk: npm install @anthropic-ai/claude-agent-sdk'
    );
    yield result(false, '@anthropic-ai/claude-agent-sdk not installed');
    return;
  }

  const controller = new AbortController();
  options?.signal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    for await (const msg of queryFn({
      prompt,
      options: {
        ...(options?.tools ? { allowedTools: options.tools } : {}),
        abortController: controller,
        ...(options?.maxTurns !== undefined ? { maxTurns: options.maxTurns } : {}),
        ...(options?.model ? { model: options.model } : {}),
        ...(options?.systemPrompt ? { systemPrompt: options.systemPrompt } : {}),
        ...(options?.mcpServers ? { mcpServers: options.mcpServers } : {}),
        ...(options?.agents ? { agents: options.agents } : {}),
        ...(options?.permissionMode ? { permissionMode: options.permissionMode } : {}),
      },
    })) {
      if (options?.signal?.aborted) break;

      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.text !== undefined) {
            yield output({ text: block.text }, 'llm.delta');
          } else if (block.name !== undefined) {
            yield output({ id: block.id, name: block.name, input: block.input }, 'llm.tool_call');
          }
        }
      }

      if (msg.type === 'result') {
        const success = msg.subtype === 'success';
        yield result(success, success ? msg.result : msg.subtype);
      }
    }
  } catch (err: unknown) {
    if (options?.signal?.aborted) return;
    const message = err instanceof Error ? err.message : String(err);
    yield errorEvent('QUERY_ERROR', message);
    yield result(false, message);
  }
}
