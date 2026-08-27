import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce Hook', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update debounced value after delay', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ val, delay }) => useDebounce(val, delay), {
      initialProps: { val: 'first', delay: 500 },
    });

    expect(result.current).toBe('first');

    // Change value
    rerender({ val: 'second', delay: 500 });
    expect(result.current).toBe('first');

    // Advance time past delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second');
    vi.useRealTimers();
  });
});
