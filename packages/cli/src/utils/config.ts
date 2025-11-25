import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { AgentageConfig, agentageConfigSchema } from '../types/config.types.js';

/**
 * Default registry URL
 */
export const DEFAULT_REGISTRY_URL = 'https://dev.agentage.io';

/**
 * Get the config directory path
 */
export const getConfigDir = (): string => join(homedir(), '.agentage');

/**
 * Get the config file path
 */
export const getConfigPath = (): string => join(getConfigDir(), 'config.json');

/**
 * Load configuration from disk
 */
export const loadConfig = async (): Promise<AgentageConfig> => {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    return agentageConfigSchema.parse(parsed);
  } catch {
    // Return empty config if file doesn't exist or is invalid
    return {};
  }
};

/**
 * Save configuration to disk
 */
export const saveConfig = async (config: AgentageConfig): Promise<void> => {
  const configPath = getConfigPath();
  const configDir = dirname(configPath);

  // Ensure directory exists
  await mkdir(configDir, { recursive: true });

  // Write config file
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
};

/**
 * Clear stored credentials (logout)
 */
export const clearConfig = async (): Promise<void> => {
  try {
    const configPath = getConfigPath();
    await rm(configPath);
  } catch {
    // Ignore if file doesn't exist
  }
};

/**
 * Get the registry URL from config or environment
 */
export const getRegistryUrl = async (): Promise<string> => {
  // Environment variable takes precedence
  const envUrl = process.env.AGENTAGE_REGISTRY_URL;
  if (envUrl) {
    return envUrl;
  }

  // Check config file
  const config = await loadConfig();
  return config.registry?.url || DEFAULT_REGISTRY_URL;
};

/**
 * Get the auth token from config or environment
 */
export const getAuthToken = async (): Promise<string | undefined> => {
  // Environment variable takes precedence
  const envToken = process.env.AGENTAGE_AUTH_TOKEN;
  if (envToken) {
    return envToken;
  }

  // Check config file
  const config = await loadConfig();
  return config.auth?.token;
};
