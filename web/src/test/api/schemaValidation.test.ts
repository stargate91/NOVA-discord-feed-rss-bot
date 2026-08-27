import { describe, it, expect } from 'vitest';
import {
  isDiscordUser,
  isUserGuild,
  isFeedMonitor,
  isGuildSettings,
  isGuildAnalyticsSummary,
  isHealthStatus,
  isGuildSummary,
  isSystemTelemetry,
  safeParseDiscordUser,
  safeParseUserGuildArray,
  safeParseFeedMonitorArray,
} from '@/types';

describe('Runtime Schema Validation & Type Guards', () => {
  describe('isDiscordUser', () => {
    it('returns true for a complete, valid Discord user object', () => {
      const validUser = {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '0001',
        avatar: '/avatar.webp',
        global_name: 'Test Global',
      };
      expect(isDiscordUser(validUser)).toBe(true);
    });

    it('returns false when required fields are missing or wrong type', () => {
      expect(isDiscordUser(null)).toBe(false);
      expect(isDiscordUser(undefined)).toBe(false);
      expect(isDiscordUser({})).toBe(false);
      expect(isDiscordUser({ id: 12345, username: 'test' })).toBe(false);
      expect(
        isDiscordUser({ id: '123', username: 'test', discriminator: '0001', avatar: null })
      ).toBe(false);
      expect(
        isDiscordUser({ id: '', username: 'test', discriminator: '0001', avatar: 'a.png' })
      ).toBe(false);
    });
  });

  describe('isUserGuild', () => {
    it('returns true for valid UserGuild payload', () => {
      const guild = {
        id: '12345',
        name: 'My Server',
        icon: null,
        owner: true,
        permissions: '8',
        hasManagePermission: true,
      };
      expect(isUserGuild(guild)).toBe(true);
    });

    it('returns false for invalid structure', () => {
      expect(isUserGuild({ id: '123', name: 'Server' })).toBe(false);
    });
  });

  describe('isFeedMonitor', () => {
    it('validates a correct feed monitor structure', () => {
      const monitor = {
        id: 'mon-1',
        guild_id: 'g-1',
        platform: 'youtube',
        target_id: 'channel_1',
        destination_channel_id: 'c-1',
        status: 'active',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z',
      };
      expect(isFeedMonitor(monitor)).toBe(true);
    });

    it('fails when critical fields are missing', () => {
      expect(isFeedMonitor({ id: 'mon-1', guild_id: 'g-1' })).toBe(false);
    });
  });

  describe('isGuildSettings', () => {
    it('validates guild settings payload', () => {
      const settings = {
        guild_id: '123',
        language: 'en',
        timezone: 'UTC',
        log_channel_id: null,
        auto_isolate_dead_channels: true,
        debug_logging_enabled: false,
      };
      expect(isGuildSettings(settings)).toBe(true);
    });
  });

  describe('isGuildAnalyticsSummary', () => {
    it('validates analytics summary with proper period and metrics', () => {
      const analytics = {
        period: '7d',
        total_posts_delivered: 100,
        success_rate: 99.9,
        avg_latency_ms: 120,
        dead_channels_count: 0,
        rate_limit_events_count: 0,
        platform_breakdown: { youtube: 50 },
      };
      expect(isGuildAnalyticsSummary(analytics)).toBe(true);
    });

    it('rejects invalid period', () => {
      const analytics = {
        period: '1year',
        total_posts_delivered: 100,
        success_rate: 99.9,
        avg_latency_ms: 120,
        dead_channels_count: 0,
        rate_limit_events_count: 0,
        platform_breakdown: {},
      };
      expect(isGuildAnalyticsSummary(analytics)).toBe(false);
    });
  });

  describe('isHealthStatus & isGuildSummary & isSystemTelemetry', () => {
    it('validates health and summary schemas', () => {
      expect(isHealthStatus({ status: 'ok' })).toBe(true);
      expect(isHealthStatus({ status: 123 })).toBe(false);

      expect(
        isGuildSummary({
          guild_id: '1',
          name: 'G',
          tier: 'ultimate',
          active_monitors: 2,
          max_monitors: 50,
        })
      ).toBe(true);

      expect(
        isSystemTelemetry({
          status: 'ok',
          version: '1.0.0',
          mode: 'production',
          database: 'sqlite',
          queue_backend: 'redis',
        })
      ).toBe(true);
    });
  });

  describe('Safe Parsing Helpers', () => {
    it('safely parses DiscordUser with fallback', () => {
      const fallback = {
        id: 'default',
        username: 'Guest',
        discriminator: '0000',
        avatar: '/default.png',
      };
      expect(safeParseDiscordUser({ invalid: true }, fallback)).toBe(fallback);
      expect(
        safeParseDiscordUser(
          { id: '1', username: 'U', discriminator: '1', avatar: 'a.png' },
          fallback
        )
      ).toEqual({ id: '1', username: 'U', discriminator: '1', avatar: 'a.png' });
    });

    it('safely filters invalid guilds in safeParseUserGuildArray', () => {
      const mixed = [
        { id: '1', name: 'Valid', icon: null, owner: true, permissions: '8' },
        { id: 2, name: 'Invalid' },
      ];
      const result = safeParseUserGuildArray(mixed);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Valid');
    });

    it('safely parses feed monitor arrays', () => {
      expect(safeParseFeedMonitorArray('not-array')).toEqual([]);
    });
  });
});
