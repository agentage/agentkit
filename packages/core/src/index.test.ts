import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT,
  SDK_VERSION,
  version,
} from './index';

describe('@agentage/core', () => {
  describe('version', () => {
    it('should export version string', () => {
      expect(version).toBe('0.0.1');
      expect(typeof version).toBe('string');
    });
  });

  describe('constants', () => {
    it('should export SDK_VERSION', () => {
      expect(SDK_VERSION).toBe('0.1.0');
      expect(typeof SDK_VERSION).toBe('string');
    });

    it('should export DEFAULT_TIMEOUT', () => {
      expect(DEFAULT_TIMEOUT).toBe(30000);
      expect(typeof DEFAULT_TIMEOUT).toBe('number');
    });

    it('should export DEFAULT_BASE_URL', () => {
      expect(DEFAULT_BASE_URL).toBe('https://api.agentkit.io');
      expect(typeof DEFAULT_BASE_URL).toBe('string');
    });
  });
});
