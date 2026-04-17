import { action } from '../action.js';
import { ActionError } from '../errors.js';
import type { ActionDefinition } from '../types.js';
import type { ActionProgress, ShellExec } from './types.js';

export interface AgentInstallInput {
  /** npm package spec, e.g. "@agentage/agent-foo@1.2.3" or a directory path */
  spec: string;
  /** Workspace directory (agents repo root) where the agent should be added */
  workspaceDir: string;
}

export interface AgentInstallOutput {
  spec: string;
  workspaceDir: string;
  command: string;
}

const validateAgentInstallInput = (raw: unknown): AgentInstallInput => {
  if (!raw || typeof raw !== 'object') throw new Error('input must be an object');
  const { spec, workspaceDir } = raw as Record<string, unknown>;
  if (typeof spec !== 'string' || spec.length === 0)
    throw new Error('spec must be a non-empty string');
  if (typeof workspaceDir !== 'string' || !workspaceDir.startsWith('/')) {
    throw new Error('workspaceDir must be an absolute path');
  }
  return { spec, workspaceDir };
};

export const createAgentInstallAction = (deps: {
  shell: ShellExec;
}): ActionDefinition<AgentInstallInput, AgentInstallOutput, ActionProgress> =>
  action({
    manifest: {
      name: 'agent:install',
      version: '1.0',
      title: 'Install agent',
      description: 'Install an agent package into the agents workspace',
      scope: 'machine',
      capability: 'agent.write',
      idempotent: false,
    },
    validateInput: validateAgentInstallInput,
    async *execute(ctx, input): AsyncGenerator<ActionProgress, AgentInstallOutput, void> {
      const command = `npm install ${input.spec}`;
      yield { step: 'install', detail: command };

      let failed = false;
      for await (const event of deps.shell(command, {
        signal: ctx.signal,
        cwd: input.workspaceDir,
      })) {
        if (event.data.type === 'result' && !event.data.success) failed = true;
      }
      if (failed)
        throw new ActionError('EXECUTION_FAILED', `npm install failed: ${input.spec}`, true);

      return { spec: input.spec, workspaceDir: input.workspaceDir, command };
    },
  });
