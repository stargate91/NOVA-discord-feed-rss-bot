import { describe, it, expect } from 'vitest';
import {
  buildDiscordOAuthUrl,
  DISCORD_OAUTH_SCOPES,
  generateOAuthState,
  validateOAuthState,
} from '@/auth/oauth';

describe('Discord OAuth URL Builder Tests', () => {
  it('should build a valid Discord OAuth2 URL with client ID, scopes, and redirect URI', () => {
    const url = buildDiscordOAuthUrl(
      'https://novafeeds.xyz/auth/callback',
      'random_csrf_state_123',
      '1489908793780338688'
    );

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://discord.com');
    expect(parsed.pathname).toBe('/oauth2/authorize');
    expect(parsed.searchParams.get('client_id')).toBe('1489908793780338688');
    expect(parsed.searchParams.get('scope')).toBe(DISCORD_OAUTH_SCOPES);
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://novafeeds.xyz/auth/callback');
    expect(parsed.searchParams.get('state')).toBe('random_csrf_state_123');
    expect(parsed.searchParams.get('response_type')).toBe('code');
  });

  it('should generate cryptographic state and validate matching returning state', () => {
    const state = generateOAuthState();
    expect(state).toBeDefined();
    expect(state.length).toBeGreaterThan(10);

    // Matching state validation returns true
    expect(validateOAuthState(state)).toBe(true);

    // Replay attack / secondary check returns false (consumed)
    expect(validateOAuthState(state)).toBe(false);

    // Mismatched state returns false
    expect(validateOAuthState('invalid_tampered_state')).toBe(false);
  });
});
