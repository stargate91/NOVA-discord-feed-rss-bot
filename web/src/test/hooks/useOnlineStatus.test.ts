import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

describe('useOnlineStatus Hook', () => {
  it('should initialize with current navigator.onLine value', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(typeof result.current.isOnline).toBe('boolean');
  });

  it('should react to online and offline window events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
