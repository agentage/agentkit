import * as authService from '../services/auth.service.js';
import * as configUtils from '../utils/config.js';
import { whoamiCommand } from './whoami.js';

// Mock dependencies
jest.mock('../services/auth.service.js');
jest.mock('../utils/config.js');
jest.mock('chalk', () => ({
  default: {
    blue: (s: string) => s,
    cyan: (s: string) => s,
    gray: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
    red: (s: string) => s,
    bold: (s: string) => s,
  },
}));

const mockGetMe = authService.getMe as jest.MockedFunction<
  typeof authService.getMe
>;
const mockLoadConfig = configUtils.loadConfig as jest.MockedFunction<
  typeof configUtils.loadConfig
>;
const mockGetRegistryUrl = configUtils.getRegistryUrl as jest.MockedFunction<
  typeof configUtils.getRegistryUrl
>;

describe('whoamiCommand', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockGetRegistryUrl.mockResolvedValue('https://dev.agentage.io');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('shows not logged in when no token', async () => {
    mockLoadConfig.mockResolvedValue({});

    await whoamiCommand();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Not logged in')
    );
  });

  it('displays user info when authenticated', async () => {
    mockLoadConfig.mockResolvedValue({
      auth: { token: 'test-token' },
    });
    mockGetMe.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    });

    await whoamiCommand();

    expect(mockGetMe).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Logged in to'),
      expect.any(String)
    );
  });

  it('handles session expired error', async () => {
    mockLoadConfig.mockResolvedValue({
      auth: { token: 'expired-token' },
    });
    mockGetMe.mockRejectedValue(
      new authService.AuthError('Session expired', 'session_expired')
    );

    await expect(whoamiCommand()).rejects.toThrow('process.exit called');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Session expired')
    );
  });
});
