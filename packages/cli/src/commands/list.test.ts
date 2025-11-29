import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { listCommand } from './list.js';

describe('listCommand', () => {
  const testAgentsDir = 'test-agents';
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Ensure we're in the original directory
    process.chdir(originalCwd);

    if (existsSync(testAgentsDir)) {
      rmSync(testAgentsDir, { recursive: true, force: true });
    }
    mkdirSync(testAgentsDir, { recursive: true });
    process.chdir(testAgentsDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testAgentsDir)) {
      rmSync(testAgentsDir, { recursive: true, force: true });
    }
  });

  test('shows message when no agents directory exists', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await listCommand();

    expect(consoleLog).toHaveBeenCalledWith(
      'No agents found. Run `agent init` to create one.'
    );

    consoleLog.mockRestore();
  });

  test('shows message when agents directory is empty', async () => {
    mkdirSync('agents');
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await listCommand();

    expect(consoleLog).toHaveBeenCalledWith(
      'No agents found. Run `agent init` to create one.'
    );

    consoleLog.mockRestore();
  });

  test('lists valid agent files', async () => {
    mkdirSync('agents');
    const validAgent = `name: test-agent
model: gpt-4
instructions: Test instructions
tools: []
variables: {}`;
    writeFileSync(join('agents', 'test-agent.yml'), validAgent);

    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await listCommand();

    expect(consoleLog).toHaveBeenCalledWith('\n📋 Available Agents:\n');
    expect(consoleLog).toHaveBeenCalledWith('  ✅ test-agent (gpt-4)');

    consoleLog.mockRestore();
  });

  test('shows validation errors for invalid agent files', async () => {
    mkdirSync('agents');
    const invalidAgent = `invalid: yaml
content: here`;
    writeFileSync(join('agents', 'invalid-agent.yml'), invalidAgent);

    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await listCommand();

    expect(consoleLog).toHaveBeenCalledWith('\n📋 Available Agents:\n');
    expect(consoleLog).toHaveBeenCalledWith(
      expect.stringContaining('❌ invalid-agent -')
    );

    consoleLog.mockRestore();
  });

  test('lists both valid and invalid agents', async () => {
    mkdirSync('agents');

    const validAgent = `name: valid-agent
model: gpt-4
instructions: Test instructions
tools: []
variables: {}`;
    writeFileSync(join('agents', 'valid-agent.yml'), validAgent);

    const invalidAgent = `name: missing-instructions
model: gpt-4`;
    writeFileSync(join('agents', 'invalid-agent.yml'), invalidAgent);

    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await listCommand();

    expect(consoleLog).toHaveBeenCalledWith('  ✅ valid-agent (gpt-4)');
    expect(consoleLog).toHaveBeenCalledWith(
      expect.stringContaining('❌ invalid-agent -')
    );

    consoleLog.mockRestore();
  });

  test('handles errors gracefully', async () => {
    mkdirSync('agents');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // Mock readdir to throw an error after initial check
    const originalReaddir = require('fs/promises').readdir;
    let callCount = 0;
    jest.spyOn(require('fs/promises'), 'readdir').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(['test.yml']);
      }
      throw new Error('Read error');
    });

    await listCommand();

    // Restore
    require('fs/promises').readdir = originalReaddir;
    consoleError.mockRestore();
  });
});
