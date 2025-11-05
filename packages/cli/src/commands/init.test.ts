import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { initCommand } from './init.js';

describe('initCommand', () => {
  const testAgentsDir = 'test-agents';

  beforeEach(() => {
    // Change to a test directory
    if (existsSync(testAgentsDir)) {
      rmSync(testAgentsDir, { recursive: true });
    }
    mkdirSync(testAgentsDir);
    process.chdir(testAgentsDir);
  });

  afterEach(() => {
    // Clean up
    process.chdir('..');
    if (existsSync(testAgentsDir)) {
      rmSync(testAgentsDir, { recursive: true });
    }
  });

  test('creates agent file with default name', async () => {
    await initCommand();

    const filePath = join('agents', 'my-agent.yml');
    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('name: my-agent');
    expect(content).toContain('model: gpt-4');
    expect(content).toContain('You are a helpful AI assistant');
  });

  test('creates agent file with custom name', async () => {
    await initCommand('custom-agent');

    const filePath = join('agents', 'custom-agent.yml');
    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('name: custom-agent');
  });

  test('creates agents directory if it does not exist', async () => {
    expect(existsSync('agents')).toBe(false);

    await initCommand('test-agent');

    expect(existsSync('agents')).toBe(true);
    expect(existsSync(join('agents', 'test-agent.yml'))).toBe(true);
  });

  test('handles errors gracefully', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // Create a scenario that will fail (read-only directory)
    mkdirSync('agents');
    const originalWriteFile = require('fs/promises').writeFile;
    jest
      .spyOn(require('fs/promises'), 'writeFile')
      .mockRejectedValue(new Error('Write failed'));

    await expect(initCommand('test')).rejects.toThrow('process.exit called');
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('❌ Failed: Write failed')
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    // Restore
    require('fs/promises').writeFile = originalWriteFile;
    mockExit.mockRestore();
    consoleError.mockRestore();
  });
});
