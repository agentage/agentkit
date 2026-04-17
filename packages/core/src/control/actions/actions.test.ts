import { describe, expect, it, vi } from 'vitest';
import { output, result } from '../../events.js';
import { createRegistry } from '../registry.js';
import type { InvokeEvent } from '../types.js';
import { createAgentInstallAction } from './agent-install.js';
import { createCliUpdateAction } from './cli-update.js';
import { createProjectAddFromOriginAction } from './project-add-from-origin.js';
import type { ShellExec } from './types.js';

const fakeShell = (success = true, observe?: (cmd: string) => void): ShellExec =>
  async function* (command) {
    observe?.(command);
    yield output(`running: ${command}`);
    yield result(success, success ? 'ok' : 'fail');
  };

const collect = async (gen: AsyncGenerator<InvokeEvent>): Promise<InvokeEvent[]> => {
  const events: InvokeEvent[] = [];
  for await (const e of gen) events.push(e);
  return events;
};

describe('cli:update action', () => {
  it('validates target as semver or latest', async () => {
    const reg = createRegistry();
    reg.register(
      createCliUpdateAction({ shell: fakeShell(), readCurrentVersion: async () => '0.17.0' })
    );
    const bad = await collect(
      reg.invoke({
        action: 'cli:update',
        input: { target: 'master' },
        callerId: 'c',
        capabilities: ['cli.write'],
      })
    );
    expect(bad.at(-1)).toMatchObject({ type: 'error', code: 'INVALID_INPUT' });
  });

  it('runs happy path with version bump and returns result envelope', async () => {
    const observed: string[] = [];
    const reg = createRegistry();
    reg.register(
      createCliUpdateAction({
        shell: fakeShell(true, (cmd) => observed.push(cmd)),
        readCurrentVersion: async () => '0.17.0',
      })
    );
    const events = await collect(
      reg.invoke({
        action: 'cli:update',
        input: { target: '0.18.0' },
        callerId: 'c',
        capabilities: ['cli.write'],
      })
    );
    expect(observed).toEqual(['npm install -g @agentage/cli@0.18.0']);
    expect(events.at(-1)).toMatchObject({
      type: 'result',
      data: { installed: '0.18.0', from: '0.17.0' },
    });
  });

  it('surfaces EXECUTION_FAILED when shell fails', async () => {
    const reg = createRegistry();
    reg.register(
      createCliUpdateAction({ shell: fakeShell(false), readCurrentVersion: async () => '0.17.0' })
    );
    const events = await collect(
      reg.invoke({
        action: 'cli:update',
        input: { target: 'latest' },
        callerId: 'c',
        capabilities: ['cli.write'],
      })
    );
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'EXECUTION_FAILED' });
  });
});

describe('project:addFromOrigin action', () => {
  it('derives name from remote and clones into parentDir', async () => {
    const observed: string[] = [];
    const reg = createRegistry();
    reg.register(
      createProjectAddFromOriginAction({ shell: fakeShell(true, (cmd) => observed.push(cmd)) })
    );
    const events = await collect(
      reg.invoke({
        action: 'project:addFromOrigin',
        input: { remote: 'git@github.com:agentage/cli.git', parentDir: '/tmp/projects' },
        callerId: 'c',
        capabilities: ['project.write'],
      })
    );
    expect(observed).toEqual(['git clone git@github.com:agentage/cli.git /tmp/projects/cli']);
    expect(events.at(-1)).toMatchObject({
      type: 'result',
      data: { name: 'cli', path: '/tmp/projects/cli', remote: 'git@github.com:agentage/cli.git' },
    });
  });

  it('rejects non-absolute parentDir', async () => {
    const reg = createRegistry();
    reg.register(createProjectAddFromOriginAction({ shell: fakeShell() }));
    const events = await collect(
      reg.invoke({
        action: 'project:addFromOrigin',
        input: { remote: 'git@github.com:a/b.git', parentDir: 'projects' },
        callerId: 'c',
        capabilities: ['project.write'],
      })
    );
    expect(events.at(-1)).toMatchObject({ type: 'error', code: 'INVALID_INPUT' });
  });

  it('passes branch flag when provided', async () => {
    const spy = vi.fn();
    const reg = createRegistry();
    reg.register(createProjectAddFromOriginAction({ shell: fakeShell(true, spy) }));
    await collect(
      reg.invoke({
        action: 'project:addFromOrigin',
        input: {
          remote: 'https://github.com/agentage/cli.git',
          parentDir: '/tmp',
          branch: 'develop',
        },
        callerId: 'c',
        capabilities: ['project.write'],
      })
    );
    expect(spy).toHaveBeenCalledWith(
      'git clone -b develop https://github.com/agentage/cli.git /tmp/cli'
    );
  });
});

describe('agent:install action', () => {
  it('runs npm install with the given spec in workspaceDir', async () => {
    const spy = vi.fn();
    const reg = createRegistry();
    reg.register(createAgentInstallAction({ shell: fakeShell(true, spy) }));
    const events = await collect(
      reg.invoke({
        action: 'agent:install',
        input: { spec: '@agentage/agent-pr@1.0.0', workspaceDir: '/home/me/agents' },
        callerId: 'c',
        capabilities: ['agent.write'],
      })
    );
    expect(spy).toHaveBeenCalledWith('npm install @agentage/agent-pr@1.0.0');
    expect(events.at(-1)).toMatchObject({
      type: 'result',
      data: { spec: '@agentage/agent-pr@1.0.0' },
    });
  });
});

describe('registry list surface', () => {
  it('exposes all three manifests for host-UI discovery', () => {
    const reg = createRegistry();
    reg.register(
      createCliUpdateAction({ shell: fakeShell(), readCurrentVersion: async () => '0.0.0' })
    );
    reg.register(createProjectAddFromOriginAction({ shell: fakeShell() }));
    reg.register(createAgentInstallAction({ shell: fakeShell() }));

    const names = reg
      .list()
      .map((m) => m.name)
      .sort();
    expect(names).toEqual(['agent:install', 'cli:update', 'project:addFromOrigin']);
    for (const m of reg.list()) {
      expect(m.capability).toMatch(/\.(read|write)$/);
      expect(m.scope).toBe('machine');
    }
  });
});
