import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'default_val'));
    expect(result.current[0]).toBe('default_val');
  });

  it('should update state and localStorage value when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'default_val'));

    act(() => {
      result.current[1]('updated_val');
    });

    expect(result.current[0]).toBe('updated_val');
    expect(localStorage.getItem('test_key')).toBe(JSON.stringify('updated_val'));
  });

  it('should handle functional state updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count_key', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem('count_key')).toBe(JSON.stringify(15));
  });
});
