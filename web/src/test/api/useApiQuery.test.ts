import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiQuery } from '@/api/useApiQuery';
import { queryCache } from '@/api/queryCache';

describe('useApiQuery Hook', () => {
  beforeEach(() => {
    queryCache.clear();
    vi.clearAllMocks();
  });

  it('should fetch data on mount and provide loading state', async () => {
    const mockData = { id: '123', status: 'active' };
    const queryFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiQuery(queryFn, [], { key: 'test-query-1' }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(queryCache.get('test-query-1')).toEqual(mockData);
  });

  it('should pass an AbortSignal to queryFn and abort on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const queryFn = vi.fn().mockImplementation((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 200));
    });

    const { unmount } = renderHook(() => useApiQuery(queryFn, []));

    expect(capturedSignal).toBeDefined();
    expect(Boolean(capturedSignal && capturedSignal.aborted)).toBe(false);

    unmount();

    expect(Boolean(capturedSignal && capturedSignal.aborted)).toBe(true);
  });

  it('should support manual abort()', async () => {
    let capturedSignal: AbortSignal | undefined;
    const queryFn = vi.fn().mockImplementation((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 200));
    });

    const { result } = renderHook(() => useApiQuery(queryFn, []));

    expect(Boolean(capturedSignal && capturedSignal.aborted)).toBe(false);

    act(() => {
      result.current.abort();
    });

    expect(Boolean(capturedSignal && capturedSignal.aborted)).toBe(true);
  });

  it('should support optimistic mutate and cache synchronization', async () => {
    const initialData = { count: 1 };
    const queryFn = vi.fn().mockResolvedValue(initialData);

    const { result } = renderHook(() =>
      useApiQuery(queryFn, [], { key: 'counter-key' })
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(initialData);
    });

    act(() => {
      result.current.mutate({ count: 5 });
    });

    expect(result.current.data).toEqual({ count: 5 });
    expect(queryCache.get('counter-key')).toEqual({ count: 5 });
  });

  it('should handle API errors and update error state', async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useApiQuery(queryFn, []));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Network failure');
  });
});
