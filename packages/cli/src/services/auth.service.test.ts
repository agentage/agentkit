import * as configUtils from '../utils/config.js';
import {
  AuthError,
  getMe,
  logout,
  pollForToken,
  requestDeviceCode,
} from './auth.service.js';

// Mock the config utils
jest.mock('../utils/config.js');

const mockGetRegistryUrl = configUtils.getRegistryUrl as jest.MockedFunction<
  typeof configUtils.getRegistryUrl
>;
const mockGetAuthToken = configUtils.getAuthToken as jest.MockedFunction<
  typeof configUtils.getAuthToken
>;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRegistryUrl.mockResolvedValue('https://dev.agentage.io');
  });

  describe('requestDeviceCode', () => {
    it('returns device code response on success', async () => {
      const deviceCodeResponse = {
        device_code: 'abc123',
        user_code: 'ABCD-1234',
        verification_uri: 'https://dev.agentage.io/device',
        expires_in: 900,
        interval: 5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(deviceCodeResponse),
      });

      const result = await requestDeviceCode();

      expect(result).toEqual(deviceCodeResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/auth/device/code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('throws AuthError on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: 'server_error',
            error_description: 'Something went wrong',
          }),
      });

      await expect(requestDeviceCode()).rejects.toThrow(AuthError);
      await expect(requestDeviceCode()).rejects.toThrow('Something went wrong');
    });
  });

  describe('pollForToken', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns token on successful authentication', async () => {
      const tokenResponse = {
        access_token: 'token123',
        token_type: 'Bearer',
        user: { id: '1', email: 'test@example.com' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(tokenResponse),
      });

      const pollPromise = pollForToken('device123', 1, 60);
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises

      const result = await pollPromise;

      expect(result).toEqual(tokenResponse);
    });

    it('continues polling on authorization_pending', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'authorization_pending' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'token123',
              token_type: 'Bearer',
            }),
        });

      const pollPromise = pollForToken('device123', 1, 60);

      // First poll
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Second poll
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      const result = await pollPromise;

      expect(result.access_token).toBe('token123');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws on access_denied', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'access_denied' }),
      });

      const pollPromise = pollForToken('device123', 1, 60);
      jest.advanceTimersByTime(1000);

      await expect(pollPromise).rejects.toThrow('Authorization was denied');
    });
  });

  describe('getMe', () => {
    it('returns user on success', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockGetAuthToken.mockResolvedValue('token123');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(user),
      });

      const result = await getMe();

      expect(result).toEqual(user);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/auth/me',
        {
          headers: { Authorization: 'Bearer token123' },
        }
      );
    });

    it('throws when not authenticated', async () => {
      mockGetAuthToken.mockResolvedValue(undefined);

      await expect(getMe()).rejects.toThrow('Not authenticated');
    });

    it('throws on session expired (401)', async () => {
      mockGetAuthToken.mockResolvedValue('expired-token');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

      await expect(getMe()).rejects.toThrow('Session expired');
    });
  });

  describe('logout', () => {
    it('calls logout endpoint when authenticated', async () => {
      mockGetAuthToken.mockResolvedValue('token123');
      mockFetch.mockResolvedValue({ ok: true });

      await logout();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/auth/logout',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );
    });

    it('does nothing when not authenticated', async () => {
      mockGetAuthToken.mockResolvedValue(undefined);

      await logout();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('ignores fetch errors', async () => {
      mockGetAuthToken.mockResolvedValue('token123');
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(logout()).resolves.not.toThrow();
    });
  });

  describe('AuthError', () => {
    it('has correct name and code', () => {
      const error = new AuthError('Test message', 'test_code');

      expect(error.name).toBe('AuthError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('test_code');
    });
  });
});
