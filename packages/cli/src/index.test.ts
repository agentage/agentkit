import { greet, version } from './index.js';

describe('CLI Package', () => {
  test('version is defined', () => {
    expect(version).toBe('0.0.1');
  });

  test('greet returns correct message', () => {
    expect(greet()).toBe('Hello from AgentKit CLI!');
  });
});
