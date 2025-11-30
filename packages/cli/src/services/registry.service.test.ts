import { RegistryApiError } from './registry.service.js';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock config utilities
jest.mock('../utils/config.js', () => ({
  getAuthToken: jest.fn().mockResolvedValue('test-token'),
  getRegistryUrl: jest.fn().mockResolvedValue('https://dev.agentage.io'),
}));

describe('Registry Service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('RegistryApiError', () => {
    test('creates error with all properties', () => {
      const error = new RegistryApiError(
        'Test error',
        'test_error',
        400,
        { field: 'value' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('test_error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('RegistryApiError');
    });
  });

  describe('publishAgent', () => {
    test('publishes agent successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          agent: {
            name: 'test-agent',
            owner: 'testuser',
            version: '2025-11-30',
            visibility: 'public',
            publishedAt: '2025-11-30T12:00:00Z',
          },
        }),
      });

      const { publishAgent } = await import('./registry.service.js');

      const result = await publishAgent({
        name: 'test-agent',
        visibility: 'public',
        version: '2025-11-30',
        content: '---\nname: test-agent\n---\nContent',
      });

      expect(result.name).toBe('test-agent');
      expect(result.owner).toBe('testuser');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/agents',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    test('throws error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'validation_error',
          message: 'Invalid agent name',
        }),
      });

      const { publishAgent } = await import('./registry.service.js');

      await expect(
        publishAgent({
          name: 'invalid',
          visibility: 'public',
          version: '1.0.0',
          content: 'test',
        })
      ).rejects.toThrow(RegistryApiError);
    });
  });

  describe('getAgent', () => {
    test('fetches agent details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            name: 'test-agent',
            owner: 'testuser',
            latestVersion: '2025-11-30',
            latestContent: 'content',
          },
        }),
      });

      const { getAgent } = await import('./registry.service.js');

      const result = await getAgent('testuser', 'test-agent');

      expect(result.name).toBe('test-agent');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/agents/testuser/test-agent',
        expect.any(Object)
      );
    });
  });

  describe('searchAgents', () => {
    test('searches with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            agents: [{ name: 'test', owner: 'user' }],
            total: 1,
            page: 1,
            limit: 10,
            hasMore: false,
          },
        }),
      });

      const { searchAgents } = await import('./registry.service.js');

      const result = await searchAgents('test', 1, 10);

      expect(result.agents).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dev.agentage.io/api/agents/search?q=test&page=1&limit=10',
        expect.any(Object)
      );
    });
  });
});
