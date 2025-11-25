import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { homedir } from 'os';
import type { AgentageConfig } from '../types/config.types.js';
import {
  clearConfig,
  DEFAULT_REGISTRY_URL,
  getAuthToken,
  getConfigDir,
  getConfigPath,
  getRegistryUrl,
  loadConfig,
  saveConfig,
} from './config.js';

// Mock fs/promises
jest.mock('fs/promises');
jest.mock('os');

const mockMkdir = mkdir as jest.MockedFunction<typeof mkdir>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
const mockRm = rm as jest.MockedFunction<typeof rm>;
const mockHomedir = homedir as jest.MockedFunction<typeof homedir>;

describe('config utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomedir.mockReturnValue('/home/testuser');
    // Clear environment variables
    delete process.env.AGENTAGE_REGISTRY_URL;
    delete process.env.AGENTAGE_AUTH_TOKEN;
  });

  describe('getConfigDir', () => {
    it('returns the correct config directory path', () => {
      expect(getConfigDir()).toBe('/home/testuser/.agentage');
    });
  });

  describe('getConfigPath', () => {
    it('returns the correct config file path', () => {
      expect(getConfigPath()).toBe('/home/testuser/.agentage/config.json');
    });
  });

  describe('loadConfig', () => {
    it('returns parsed config when file exists', async () => {
      const config: AgentageConfig = {
        auth: {
          token: 'test-token',
          user: { id: '123', email: 'test@example.com' },
        },
      };
      mockReadFile.mockResolvedValue(JSON.stringify(config));

      const result = await loadConfig();

      expect(result).toEqual(config);
      expect(mockReadFile).toHaveBeenCalledWith(
        '/home/testuser/.agentage/config.json',
        'utf-8'
      );
    });

    it('returns empty config when file does not exist', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      const result = await loadConfig();

      expect(result).toEqual({});
    });

    it('returns empty config when file contains invalid JSON', async () => {
      mockReadFile.mockResolvedValue('invalid json');

      const result = await loadConfig();

      expect(result).toEqual({});
    });
  });

  describe('saveConfig', () => {
    it('creates directory and writes config file', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const config: AgentageConfig = {
        auth: { token: 'test-token' },
      };

      await saveConfig(config);

      expect(mockMkdir).toHaveBeenCalledWith('/home/testuser/.agentage', {
        recursive: true,
      });
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/home/testuser/.agentage/config.json',
        JSON.stringify(config, null, 2),
        'utf-8'
      );
    });
  });

  describe('clearConfig', () => {
    it('removes the config file', async () => {
      mockRm.mockResolvedValue(undefined);

      await clearConfig();

      expect(mockRm).toHaveBeenCalledWith(
        '/home/testuser/.agentage/config.json'
      );
    });

    it('ignores error if file does not exist', async () => {
      mockRm.mockRejectedValue(new Error('ENOENT'));

      await expect(clearConfig()).resolves.not.toThrow();
    });
  });

  describe('getRegistryUrl', () => {
    it('returns environment variable when set', async () => {
      process.env.AGENTAGE_REGISTRY_URL = 'https://custom.registry.io';

      const result = await getRegistryUrl();

      expect(result).toBe('https://custom.registry.io');
    });

    it('returns config value when no env var', async () => {
      const config: AgentageConfig = {
        registry: { url: 'https://config.registry.io' },
      };
      mockReadFile.mockResolvedValue(JSON.stringify(config));

      const result = await getRegistryUrl();

      expect(result).toBe('https://config.registry.io');
    });

    it('returns default when no env var or config', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      const result = await getRegistryUrl();

      expect(result).toBe(DEFAULT_REGISTRY_URL);
    });
  });

  describe('getAuthToken', () => {
    it('returns environment variable when set', async () => {
      process.env.AGENTAGE_AUTH_TOKEN = 'env-token';

      const result = await getAuthToken();

      expect(result).toBe('env-token');
    });

    it('returns config value when no env var', async () => {
      const config: AgentageConfig = {
        auth: { token: 'config-token' },
      };
      mockReadFile.mockResolvedValue(JSON.stringify(config));

      const result = await getAuthToken();

      expect(result).toBe('config-token');
    });

    it('returns undefined when no token available', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      const result = await getAuthToken();

      expect(result).toBeUndefined();
    });
  });
});
