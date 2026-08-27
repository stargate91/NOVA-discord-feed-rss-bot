import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAuthSession,
  getStoredSession,
  clearStoredSession,
  AUTH_EXPIRY_KEY,
} from '@/auth/session';
import { AUTH_TOKEN_KEY } from '@/auth/context';

describe('Auth Session Storage & Expiry Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve session with active token and refresh token', () => {
    saveAuthSession('token_12345', 3600, 'refresh_67890');

    const session = getStoredSession();
    expect(session.token).toBe('token_12345');
    expect(session.refreshToken).toBe('refresh_67890');
    expect(session.expiresAt).toBeGreaterThan(Date.now());
    expect(session.isExpired).toBe(false);
  });

  it('should detect when stored session has expired', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'expired_token');
    // Set timestamp in the past
    localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() - 5000));

    const session = getStoredSession();
    expect(session.isExpired).toBe(true);
  });

  it('should clear all session items from storage', () => {
    saveAuthSession('token_123', 3600, 'refresh_123');
    clearStoredSession();

    const session = getStoredSession();
    expect(session.token).toBeNull();
    expect(session.refreshToken).toBeNull();
    expect(session.expiresAt).toBeNull();
  });
});
