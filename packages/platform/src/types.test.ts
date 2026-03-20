import { describe, expect, it } from 'vitest';
import type {
  AgentInfo,
  Heartbeat,
  Machine,
  WsDaemonMessage,
  WsExecuteRequest,
  WsHubMessage,
  WsMessage,
  WsRunEvent,
} from './types.js';

describe('platform types (compile-only)', () => {
  it('Machine object satisfies Machine type', () => {
    const machine: Machine = {
      id: 'test-id',
      name: 'test-machine',
      platform: 'linux',
      arch: 'x64',
      daemonVersion: '0.2.0',
      agents: [],
      status: 'online',
      lastSeenAt: Date.now(),
    };
    expect(machine.id).toBe('test-id');
  });

  it('Heartbeat object satisfies Heartbeat type', () => {
    const heartbeat: Heartbeat = {
      machineId: 'test-id',
      agents: [],
      activeRunIds: ['run-1'],
      resources: { cpuUsage: 50, memoryUsedMb: 1024, memoryTotalMb: 2048 },
    };
    expect(heartbeat.machineId).toBe('test-id');
  });

  it('WsExecuteRequest satisfies WsHubMessage', () => {
    const msg: WsHubMessage = {
      type: 'execute',
      requestId: 'req-1',
      agentName: 'test',
      input: { task: 'hello' },
    };
    expect(msg.type).toBe('execute');
  });

  it('WsRunEvent satisfies WsDaemonMessage', () => {
    const msg: WsDaemonMessage = {
      type: 'run_event',
      runId: 'run-1',
      event: {
        type: 'output',
        data: { type: 'output', content: 'hello', format: 'text' },
        timestamp: Date.now(),
      },
    };
    expect(msg.type).toBe('run_event');
  });

  it('WsMessage is union of hub + daemon messages', () => {
    const hubMsg: WsMessage = {
      type: 'execute',
      requestId: 'req-1',
      agentName: 'test',
      input: { task: 'hello' },
    } satisfies WsExecuteRequest;

    const daemonMsg: WsMessage = {
      type: 'run_event',
      runId: 'run-1',
      event: {
        type: 'output',
        data: { type: 'output', content: 'hello' },
        timestamp: Date.now(),
      },
    } satisfies WsRunEvent;

    expect(hubMsg.type).toBe('execute');
    expect(daemonMsg.type).toBe('run_event');
  });

  it('AgentInfo extends AgentManifest correctly', () => {
    const info: AgentInfo = {
      name: 'test-agent',
      path: '/tmp/test',
      machineId: 'machine-1',
      machineName: 'my-machine',
      machineStatus: 'online',
    };
    expect(info.name).toBe('test-agent');
    expect(info.machineId).toBe('machine-1');
  });
});
