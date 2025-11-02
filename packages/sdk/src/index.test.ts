import { SDK_VERSION, version } from './index.js';

describe('SDK', () => {
  test('exports version', () => {
    expect(version).toBe('0.1.0');
  });

  test('SDK_VERSION constant is defined', () => {
    expect(SDK_VERSION).toBe('0.1.0');
  });
});
