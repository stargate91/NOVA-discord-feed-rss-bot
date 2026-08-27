import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/api/client';
import { ApiError } from '@/api/types';

describe('ApiClient Middleware & Interceptor Pipeline', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8080');
    vi.restoreAllMocks();
  });

  it('runs request interceptor and allows modifying headers and URL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as unknown as Response);

    const remove = client.use({
      onRequest: (context) => {
        context.headers['X-Custom-Client-Trace'] = 'trace-uuid-123';
        return context;
      },
    });

    const res = await client.get<{ success: boolean }>('/api/v1/test');

    expect(res).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Client-Trace': 'trace-uuid-123',
        }),
      })
    );

    remove();
  });

  it('runs response interceptor and allows transforming payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ rawValue: 42 }),
    } as unknown as Response);

    client.use({
      onResponse: (data) => {
        const d = data as { rawValue: number };
        return { ...d, doubled: d.rawValue * 2 };
      },
    });

    const res = await client.get<{ rawValue: number; doubled: number }>('/api/v1/calc');
    expect(res).toEqual({ rawValue: 42, doubled: 84 });
  });

  it('runs error interceptor when request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Access denied' }),
    } as unknown as Response);

    const errorInterceptorSpy = vi.fn();

    client.use({
      onError: (err, context) => {
        errorInterceptorSpy(err.status, context.url);
      },
    });

    await expect(client.get('/api/v1/protected')).rejects.toThrow(ApiError);
    expect(errorInterceptorSpy).toHaveBeenCalledWith(403, 'http://localhost:8080/api/v1/protected');
  });

  it('unsubscribes interceptor when calling returned cleanup function', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    } as unknown as Response);

    const interceptorFn = vi.fn((ctx) => ctx);

    const unregister = client.use({ onRequest: interceptorFn });

    await client.get('/test1');
    expect(interceptorFn).toHaveBeenCalledTimes(1);

    // Unsubscribe
    unregister();

    await client.get('/test2');
    expect(interceptorFn).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
