import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '@/api/client';
import { ApiError } from '@/api/types';

describe('ApiClient Unit Tests', () => {
  let client: ApiClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8080');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should successfully perform GET request and return parsed JSON', async () => {
    const mockData = { status: 'healthy', version: '2.0.0' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(mockData)),
      json: () => Promise.resolve(mockData),
    });

    const result = await client.get<{ status: string }>('/health');
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/health',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should send POST request with JSON body and custom headers', async () => {
    const postPayload = { name: 'New Feed', url: 'https://youtube.com/@test' };
    const responsePayload = { id: 'feed-123', ...postPayload };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(responsePayload)),
      json: () => Promise.resolve(responsePayload),
    });

    const result = await client.post('/api/feeds', postPayload);
    expect(result).toEqual(responsePayload);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/feeds',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postPayload),
      })
    );
  });

  it('should deduplicate simultaneous identical in-flight GET requests when dedup is enabled', async () => {
    const mockData = { count: 42 };
    let fetchCalls = 0;

    globalThis.fetch = vi.fn().mockImplementation(() => {
      fetchCalls += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            text: () => Promise.resolve(JSON.stringify(mockData)),
            json: () => Promise.resolve(mockData),
          });
        }, 30);
      });
    });

    const [res1, res2] = await Promise.all([
      client.get('/api/stats', { dedup: true }),
      client.get('/api/stats', { dedup: true }),
    ]);

    expect(res1).toEqual(mockData);
    expect(res2).toEqual(mockData);
    expect(fetchCalls).toBe(1);
  });

  it('should retry on 500 server errors and succeed on second attempt', async () => {
    let callCount = 0;
    const successData = { success: true };

    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers({ 'content-type': 'text/plain' }),
          text: () => Promise.resolve('Server Error'),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify(successData)),
        json: () => Promise.resolve(successData),
      });
    });

    const result = await client.get('/api/unstable', { maxRetries: 2, retryDelayMs: 10 });
    expect(result).toEqual(successData);
    expect(callCount).toBe(2);
  });

  it('should throw ApiError with status and message when non-200 error response is received', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ detail: 'Resource missing' })),
      json: () => Promise.resolve({ detail: 'Resource missing' }),
    });

    await expect(client.get('/api/missing', { maxRetries: 0 })).rejects.toThrow(ApiError);
  });

  it('should notify registered onError listeners when an API error occurs', async () => {
    const errorListener = vi.fn();
    const unsubscribe = client.onError(errorListener);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: () => Promise.resolve('Forbidden action'),
    });

    try {
      await client.get('/api/forbidden', { maxRetries: 0 });
    } catch {
      // expected
    }

    expect(errorListener).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, message: expect.stringContaining('Forbidden') })
    );

    unsubscribe();
  });

  it('should cleanly normalize baseUrl and avoid double slashes', async () => {
    const customClient = new ApiClient('http://localhost:8080///');
    expect(customClient.getBaseUrl()).toBe('http://localhost:8080');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve('{}'),
      json: () => Promise.resolve({}),
    });

    await customClient.get('api/data');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/data',
      expect.anything()
    );
  });

  it('should throttle and queue concurrent mutations when exceeding concurrency limit', async () => {
    const queueClient = new ApiClient({ baseUrl: 'http://localhost:8080', maxConcurrentMutations: 2 });
    let activeInFlight = 0;
    let maxObservedInFlight = 0;

    globalThis.fetch = vi.fn().mockImplementation(() => {
      activeInFlight += 1;
      maxObservedInFlight = Math.max(maxObservedInFlight, activeInFlight);

      return new Promise((resolve) => {
        setTimeout(() => {
          activeInFlight -= 1;
          resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            text: () => Promise.resolve('{"ok":true}'),
            json: () => Promise.resolve({ ok: true }),
          });
        }, 20);
      });
    });

    await Promise.all([
      queueClient.post('/api/item1', {}),
      queueClient.post('/api/item2', {}),
      queueClient.post('/api/item3', {}),
      queueClient.post('/api/item4', {}),
    ]);

    expect(maxObservedInFlight).toBe(2);
  });
});
