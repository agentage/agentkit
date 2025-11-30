import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { publishCommand } from './publish.js';

// Mock dependencies
jest.mock('../utils/config.js', () => ({
  getAuthToken: jest.fn(),
  getRegistryUrl: jest.fn().mockResolvedValue('https://dev.agentage.io'),
}));

jest.mock('../services/registry.service.js', () => ({
  publishAgent: jest.fn(),
  RegistryApiError: class extends Error {
    constructor(message: string, public code: string, public statusCode: number) {
      super(message);
    }
  },
}));

describe('publishCommand', () => {
  const testDir = 'test-publish-workspace';
  const originalCwd = process.cwd();

  beforeEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('requires authentication', async () => {
    const { getAuthToken } = require('../utils/config.js');
    getAuthToken.mockResolvedValue(null);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

    await expect(publishCommand()).rejects.toThrow('process.exit');

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Not logged in')
    );

    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  test('finds agent file in current directory', async () => {
    const { getAuthToken } = require('../utils/config.js');
    const { publishAgent } = require('../services/registry.service.js');

    getAuthToken.mockResolvedValue('test-token');
    publishAgent.mockResolvedValue({
      name: 'my-agent',
      owner: 'testuser',
      version: '2025-11-30',
    });

    const agentContent = `---
name: my-agent
description: Test agent
---
You are helpful.`;
    writeFileSync('my-agent.agent.md', agentContent);

    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

    await publishCommand();

    expect(publishAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my-agent',
        visibility: 'public',
      })
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Published')
    );

    mockConsoleLog.mockRestore();
  });

  test('supports dry run', async () => {
    const { getAuthToken } = require('../utils/config.js');
    const { publishAgent } = require('../services/registry.service.js');

    getAuthToken.mockResolvedValue('test-token');

    const agentContent = `---
name: my-agent
description: Test agent
---
You are helpful.`;
    writeFileSync('my-agent.agent.md', agentContent);

    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

    await publishCommand(undefined, { dryRun: true });

    expect(publishAgent).not.toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Dry run')
    );

    mockConsoleLog.mockRestore();
  });

  test('validates agent name', async () => {
    const { getAuthToken } = require('../utils/config.js');
    getAuthToken.mockResolvedValue('test-token');

    const agentContent = `---
name: Invalid-Name
---
Content`;
    writeFileSync('agent.agent.md', agentContent);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

    await expect(publishCommand()).rejects.toThrow('process.exit');

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid agent name')
    );

    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });
});
