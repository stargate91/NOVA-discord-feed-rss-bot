import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/common/Toast';
import { useFeedForm } from '@/features/feeds';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nProvider>
    <ToastProvider>{children}</ToastProvider>
  </I18nProvider>
);

describe('useFeedForm Hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useFeedForm('youtube'), { wrapper: TestWrapper });

    expect(result.current.formState.platform).toBe('youtube');
    expect(result.current.formState.targetId).toBe('');
    expect(result.current.formState.destChannel).toBe('feed-alerts');
    expect(result.current.formState.pingRole).toBe('');
  });

  it('updates form state fields properly', () => {
    const { result } = renderHook(() => useFeedForm('youtube'), { wrapper: TestWrapper });

    act(() => {
      result.current.setPlatform('twitch');
      result.current.setTargetId('shroud');
      result.current.setDestChannel('live-updates');
      result.current.setPingRole('StreamPing');
    });

    expect(result.current.formState.platform).toBe('twitch');
    expect(result.current.formState.targetId).toBe('shroud');
    expect(result.current.formState.destChannel).toBe('live-updates');
    expect(result.current.formState.pingRole).toBe('StreamPing');
  });

  it('resets form fields on resetForm()', () => {
    const { result } = renderHook(() => useFeedForm('youtube'), { wrapper: TestWrapper });

    act(() => {
      result.current.setTargetId('test_channel');
      result.current.setDestChannel('my-channel');
      result.current.setPingRole('Admin');
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.targetId).toBe('');
    expect(result.current.formState.destChannel).toBe('feed-alerts');
    expect(result.current.formState.pingRole).toBe('');
  });

  it('validates target ID presence', () => {
    const { result } = renderHook(() => useFeedForm('youtube'), { wrapper: TestWrapper });

    expect(result.current.validate()).toBe(false);

    act(() => {
      result.current.setTargetId('PewDiePie');
    });

    expect(result.current.validate()).toBe(true);
  });
});
