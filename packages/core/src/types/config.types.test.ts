import { describe, expect, it } from '@jest/globals';
import type { ConfigEntry, EnvironmentConfig, RuntimeConfig } from './config.types.js';

describe('Config Types', () => {
  describe('ConfigEntry', () => {
    it('should define valid config entry', () => {
      const entry: ConfigEntry = {
        key: 'apiKey',
        value: 'sk-123',
      };

      expect(entry.key).toBe('apiKey');
      expect(entry.value).toBe('sk-123');
      expect(entry.scope).toBeUndefined();
    });

    it('should define config entry with scope', () => {
      const entry: ConfigEntry = {
        key: 'timeout',
        value: '30000',
        scope: ['development', 'staging'],
      };

      expect(entry.key).toBe('timeout');
      expect(entry.value).toBe('30000');
      expect(entry.scope).toEqual(['development', 'staging']);
    });
  });

  describe('RuntimeConfig', () => {
    it('should define valid runtime config', () => {
      const config: RuntimeConfig = {
        entries: [
          { key: 'apiKey', value: 'sk-123' },
          { key: 'baseUrl', value: 'https://api.example.com' },
        ],
      };

      expect(config.entries).toHaveLength(2);
      expect(config.entries[0].key).toBe('apiKey');
      expect(config.entries[0].value).toBe('sk-123');
    });

    it('should allow entries with scope', () => {
      const config: RuntimeConfig = {
        entries: [
          { key: 'apiKey', value: 'sk-123', scope: ['production'] },
          { key: 'timeout', value: '5000', scope: ['development', 'test'] },
        ],
      };

      expect(config.entries[0].scope).toEqual(['production']);
      expect(config.entries[1].scope).toEqual(['development', 'test']);
    });

    it('should allow empty entries', () => {
      const config: RuntimeConfig = {
        entries: [],
      };

      expect(config.entries).toHaveLength(0);
    });
  });

  describe('EnvironmentConfig', () => {
    it('should define valid environment config with all properties', () => {
      const config: EnvironmentConfig = {
        apiKeys: {
          openai: 'sk-123',
          anthropic: 'sk-456',
        },
        env: {
          NODE_ENV: 'production',
          LOG_LEVEL: 'info',
        },
        timeout: 30000,
        retry: {
          maxAttempts: 3,
          backoff: 1000,
        },
      };

      expect(config.apiKeys?.openai).toBe('sk-123');
      expect(config.env?.NODE_ENV).toBe('production');
      expect(config.timeout).toBe(30000);
      expect(config.retry?.maxAttempts).toBe(3);
    });

    it('should allow partial config', () => {
      const config: EnvironmentConfig = {
        timeout: 5000,
      };

      expect(config.timeout).toBe(5000);
      expect(config.apiKeys).toBeUndefined();
      expect(config.retry).toBeUndefined();
    });

    it('should allow empty config', () => {
      const config: EnvironmentConfig = {};

      expect(config).toEqual({});
    });
  });
});
