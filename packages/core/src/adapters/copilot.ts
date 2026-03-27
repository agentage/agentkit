import type { RunEvent } from '../types.js';
import { output, error as errorEvent, result } from '../events.js';

/** Options for the Copilot SDK adapter */
export interface CopilotOptions {
  signal?: AbortSignal;
  model?: string;
  streaming?: boolean;
  tools?: unknown[];
  mcpServers?: Record<string, unknown>;
  onPermissionRequest?: unknown;
}

// Shapes expected from dynamic import of @github/copilot-sdk
interface SdkClient {
  start(): Promise<void>;
  createSession(config: Record<string, unknown>): Promise<SdkSession>;
  stop(): Promise<unknown[]>;
}

interface SdkSession {
  on(event: string, handler: (event: Record<string, unknown>) => void): () => void;
  send(options: { prompt: string }): Promise<string>;
  abort(): Promise<void>;
  disconnect(): Promise<void>;
}

/** Run a task using the GitHub Copilot SDK (dynamic import) */
export async function* copilot(prompt: string, options?: CopilotOptions): AsyncGenerator<RunEvent> {
  let ClientClass: new () => SdkClient;
  let approveAllFn: unknown;

  try {
    const specifier = '@github/copilot-sdk';
    const sdk = (await import(specifier)) as {
      CopilotClient: typeof ClientClass;
      approveAll: unknown;
    };
    ClientClass = sdk.CopilotClient;
    approveAllFn = sdk.approveAll;
  } catch {
    yield errorEvent('MISSING_SDK', 'Install @github/copilot-sdk: npm install @github/copilot-sdk');
    yield result(false, '@github/copilot-sdk not installed');
    return;
  }

  const client = new ClientClass();
  let session: SdkSession | undefined;

  try {
    await client.start();

    session = await client.createSession({
      model: options?.model ?? 'gpt-4o',
      onPermissionRequest: options?.onPermissionRequest ?? approveAllFn,
      streaming: options?.streaming ?? true,
      ...(options?.tools ? { tools: options.tools } : {}),
      ...(options?.mcpServers ? { mcpServers: options.mcpServers } : {}),
    });

    options?.signal?.addEventListener('abort', () => session?.abort(), { once: true });

    const chunks: string[] = [];
    const idle = new Promise<void>((resolve) => {
      session!.on('session.idle', () => resolve());
    });

    session.on('assistant.message_delta', (event: Record<string, unknown>) => {
      chunks.push(String(event.deltaContent ?? ''));
    });

    await session.send({ prompt });
    await idle;

    if (chunks.length > 0) {
      yield output(chunks.join(''));
    }
    yield result(true);
  } catch (err: unknown) {
    if (options?.signal?.aborted) return;
    const message = err instanceof Error ? err.message : String(err);
    yield errorEvent('COPILOT_ERROR', message);
    yield result(false, message);
  } finally {
    if (session) {
      await session.disconnect().catch(() => {});
    }
    await client.stop().catch(() => {});
  }
}
