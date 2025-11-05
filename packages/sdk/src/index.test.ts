import { version } from './index.js';

describe('SDK', () => {
  test('exports version', () => {
    expect(version).toBe('0.0.1');
  });
});
