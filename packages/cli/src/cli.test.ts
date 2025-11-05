import { execSync } from 'child_process';
import { existsSync, rmSync, unlinkSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(__dirname, 'cli.ts');

describe('CLI Commands', () => {
  // Cleanup any test files
  afterEach(() => {
    const testFiles = ['test-agent.agent.yml', 'my-agent.agent.yml'];
    testFiles.forEach((file) => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
    // Cleanup agents directory
    if (existsSync('agents')) {
      rmSync('agents', { recursive: true, force: true });
    }
  });
  test('CLI shows version', () => {
    const output = execSync(`tsx ${CLI_PATH} --version`, {
      encoding: 'utf-8',
    });
    expect(output.trim()).toBe('0.1.2');
  });

  test('CLI shows help', () => {
    const output = execSync(`tsx ${CLI_PATH} --help`, {
      encoding: 'utf-8',
    });
    expect(output).toContain(
      'CLI tool for creating and running AI agents locally'
    );
    expect(output).toContain('init');
    expect(output).toContain('run');
    expect(output).toContain('list');
  });

  test('init command creates agent file', () => {
    const output = execSync(`tsx ${CLI_PATH} init test-agent`, {
      encoding: 'utf-8',
    });
    expect(output).toContain('✅ Created agents/test-agent.yml');
    expect(existsSync('agents/test-agent.yml')).toBe(true);
  });

  test('run command requires agent file', () => {
    try {
      execSync(`tsx ${CLI_PATH} run my-agent "hello"`, {
        encoding: 'utf-8',
      });
      fail('Should have thrown an error');
    } catch (error) {
      const err = error as Error & { stdout: string; stderr: string };
      expect(err.stderr || err.stdout || err.message).toContain('Failed');
    }
  });

  test('list command shows no agents message', () => {
    const output = execSync(`tsx ${CLI_PATH} list`, {
      encoding: 'utf-8',
    });
    expect(output).toContain('No agents found');
  });
});
