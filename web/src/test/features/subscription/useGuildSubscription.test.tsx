import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/common/Toast';
import { useGuildSubscription } from '@/features/subscription';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nProvider>
    <ToastProvider>{children}</ToastProvider>
  </I18nProvider>
);

describe('useGuildSubscription Hook', () => {
  it('initializes with default professional tier entitlements', () => {
    const { result } = renderHook(() => useGuildSubscription('guild-123'), {
      wrapper: TestWrapper,
    });

    expect(result.current.entitlements.tier).toBe('professional');
    expect(result.current.activeTier).toBe('professional');
    expect(result.current.entitlements.max_monitors).toBe(25);
  });

  it('successfully upgrades tier when applying valid promo code', () => {
    const { result } = renderHook(() => useGuildSubscription('guild-123'), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.setPromoCode('nova2026');
    });

    act(() => {
      result.current.applyPromoCode();
    });

    expect(result.current.entitlements.tier).toBe('ultimate');
    expect(result.current.activeTier).toBe('ultimate');
    expect(result.current.entitlements.max_monitors).toBe(50);
    expect(result.current.promoCode).toBe('');
  });

  it('rejects invalid promo codes without changing tier', () => {
    const { result } = renderHook(() => useGuildSubscription('guild-123'), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.setPromoCode('invalid_code_123');
    });

    act(() => {
      result.current.applyPromoCode();
    });

    expect(result.current.entitlements.tier).toBe('professional');
  });
});
