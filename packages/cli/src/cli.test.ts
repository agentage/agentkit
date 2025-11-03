import { execSync } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, 'cli.ts');

describe('CLI Commands', () => {
  test('CLI shows version', () => {
    const output = execSync(`tsx ${CLI_PATH} --version`, {
      encoding: 'utf-8',
    });
    expect(output.trim()).toBe('0.1.0');
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

  test('init command shows coming soon message', () => {
    const output = execSync(`tsx ${CLI_PATH} init test-agent`, {
      encoding: 'utf-8',
    });
    expect(output).toContain('🚀 Init command');
    expect(output).toContain('test-agent');
  });

  test('run command shows coming soon message', () => {
    const output = execSync(`tsx ${CLI_PATH} run my-agent "hello"`, {
      encoding: 'utf-8',
    });
    expect(output).toContain('▶️  Run command');
    expect(output).toContain('my-agent');
    expect(output).toContain('hello');
  });

  test('list command shows coming soon message', () => {
    const output = execSync(`tsx ${CLI_PATH} list`, {
      encoding: 'utf-8',
    });
    expect(output).toContain('📋 List command');
  });
});
