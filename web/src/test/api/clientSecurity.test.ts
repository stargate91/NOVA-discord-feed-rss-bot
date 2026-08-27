import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

describe('ApiClient Security & Session Management', () => {
  beforeEach(() => {
    apiClient.clearSession();
    vi.clearAllMocks();
  });

  it('should attach in-memory Authorization and Admin Webhook headers', async () => {
    apiClient.setAuthToken('test_jwt_bearer_token');
    apiClient.setAdminSecret('super_secret_webhook_key');

    let capturedHeaders: HeadersInit | undefined;
    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedHeaders = init.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/test-endpoint');

    expect(capturedHeaders).toBeDefined();
    const headers = capturedHeaders as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test_jwt_bearer_token');
    expect(headers['X-Webhook-Secret']).toBe('super_secret_webhook_key');
  });

  it('should attach CSRF token on mutating requests (POST, PUT, DELETE)', async () => {
    apiClient.setCsrfToken('csrf_token_xyz123');

    let capturedHeaders: HeadersInit | undefined;
    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedHeaders = init.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.post('/create-feed', { target: 'channel1' });

    expect(capturedHeaders).toBeDefined();
    const headers = capturedHeaders as Record<string, string>;
    expect(headers['X-CSRF-Token']).toBe('csrf_token_xyz123');
  });

  it('should trigger token refresh handler and retry on 401 Unauthorized', async () => {
    let callCount = 0;
    const refreshHandler = vi.fn().mockResolvedValue('new_refreshed_access_token');
    apiClient.setAuthToken('expired_access_token');
    apiClient.setTokenRefreshHandler(refreshHandler);

    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      callCount += 1;
      const headers = init.headers as Record<string, string>;

      if (callCount === 1) {
        expect(headers['Authorization']).toBe('Bearer expired_access_token');
        return Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ message: 'Token expired' }),
        });
      }

      expect(headers['Authorization']).toBe('Bearer new_refreshed_access_token');
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ refreshedSuccess: true }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient.get<{ refreshedSuccess: boolean }>('/protected-data');

    expect(refreshHandler).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ refreshedSuccess: true });
    expect(apiClient.getAuthToken()).toBe('new_refreshed_access_token');
  });
});
