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

  it('should persist and retrieve user profile alongside session', () => {
    const mockUser = {
      id: '12345',
      username: 'TestUser',
      discriminator: '0001',
      avatar: '/avatar.webp',
    };

    saveAuthSession('token_abc', 3600, undefined, mockUser);
    const session = getStoredSession();
    expect(session.user).toEqual(mockUser);
  });

  it('should safely reject and clean up corrupted user profile from localStorage', () => {
    // Missing required avatar and username fields
    localStorage.setItem('nova_auth_user', JSON.stringify({ id: '12345', invalidProp: true }));

    const session = getStoredSession();
    expect(session.user).toBeNull();
    // Verify it automatically cleaned up the corrupted key
    expect(localStorage.getItem('nova_auth_user')).toBeNull();
  });

  it('should safely handle unparseable JSON in stored user profile', () => {
    localStorage.setItem('nova_auth_user', '{{bad-json');

    const session = getStoredSession();
    expect(session.user).toBeNull();
  });
});
