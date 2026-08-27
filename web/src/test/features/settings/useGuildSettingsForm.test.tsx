import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/common/Toast';
import { useGuildSettingsForm } from '@/features/settings';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nProvider>
    <ToastProvider>{children}</ToastProvider>
  </I18nProvider>
);

describe('useGuildSettingsForm Hook', () => {
  it('initializes with default guild settings', () => {
    const { result } = renderHook(() => useGuildSettingsForm('guild-123'), {
      wrapper: TestWrapper,
    });

    expect(result.current.formState.locale).toBe('en');
    expect(result.current.formState.timezone).toBe('UTC');
    expect(result.current.formState.autoIsolate).toBe(true);
    expect(result.current.formState.debugLogs).toBe(false);
  });

  it('updates settings form state properly', () => {
    const { result } = renderHook(() => useGuildSettingsForm('guild-123'), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.setLocale('hu');
      result.current.setTimezone('Europe/Budapest');
      result.current.setLogChannel('987654321');
      result.current.setAutoIsolate(false);
      result.current.setDebugLogs(true);
    });

    expect(result.current.formState.locale).toBe('hu');
    expect(result.current.formState.timezone).toBe('Europe/Budapest');
    expect(result.current.formState.logChannel).toBe('987654321');
    expect(result.current.formState.autoIsolate).toBe(false);
    expect(result.current.formState.debugLogs).toBe(true);
  });
});
