import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiMutation } from '@/api/useApiMutation';
import { queryCache } from '@/api/queryCache';

describe('useApiMutation Hook Tests', () => {
  it('should successfully execute mutation, update data/success flags, and invoke onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const mutationFn = vi.fn().mockResolvedValue({ id: '123', status: 'saved' });

    const { result } = renderHook(() =>
      useApiMutation(mutationFn, {
        onSuccess,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeNull();

    let mutationResult;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({ name: 'Nova Test' });
    });

    expect(mutationResult).toEqual({ id: '123', status: 'saved' });
    expect(result.current.data).toEqual({ id: '123', status: 'saved' });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith({ id: '123', status: 'saved' }, { name: 'Nova Test' });
  });

  it('should handle mutation errors, set isError/error, and invoke onError callback', async () => {
    const onError = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() =>
      useApiMutation(mutationFn, {
        onError,
      })
    );

    await act(async () => {
      const res = await result.current.mutate({ name: 'Fail test' });
      expect(res).toBeNull();
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error?.message).toBe('Network failure');
    expect(onError).toHaveBeenCalled();
  });

  it('should invalidate specified cache keys upon successful mutation', async () => {
    queryCache.set('guild_list', ['guild1', 'guild2']);
    expect(queryCache.get('guild_list')).toBeDefined();

    const mutationFn = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() =>
      useApiMutation<{ success: boolean }, void>(mutationFn, {
        invalidateKeys: ['guild_list'],
      })
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryCache.get('guild_list')).toBeUndefined();
  });
});
