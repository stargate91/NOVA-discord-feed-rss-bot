import api from './api_client';
import { DiscordChannel, DiscordRole, GuildInfo, GuildSettings, GuildFeatures } from '@/types/guild';
import { MemoryCache } from '@/lib/cache';

const DEFAULT_CACHE_TTL_MS = 60 * 1000; // 60s cache TTL
const guildCache = new MemoryCache(DEFAULT_CACHE_TTL_MS);


export const guildService = {
  /**
   * Fetch user's Discord guilds with caching and request deduplication.
   */
  async getGuilds(forceRefresh: boolean = false): Promise<Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>> {
    return guildCache.getOrFetch(
      'guilds_list',
      () => api.get<Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>>('/api/guilds'),
      DEFAULT_CACHE_TTL_MS,
      forceRefresh
    );
  },

  /**
   * Fetch Discord channels for a specific guild with caching and deduplication.
   */
  async getChannels(guildId: string, forceRefresh: boolean = false): Promise<DiscordChannel[]> {
    if (!guildId) return [];
    return guildCache.getOrFetch(
      `guild_${guildId}_channels`,
      () => api.get<DiscordChannel[]>(`/api/guilds/${guildId}/channels`),
      DEFAULT_CACHE_TTL_MS,
      forceRefresh
    );
  },

  /**
   * Fetch Discord roles for a specific guild with caching and deduplication.
   */
  async getRoles(guildId: string, forceRefresh: boolean = false): Promise<DiscordRole[]> {
    if (!guildId) return [];
    return guildCache.getOrFetch(
      `guild_${guildId}_roles`,
      () => api.get<DiscordRole[]>(`/api/guilds/${guildId}/roles`),
      DEFAULT_CACHE_TTL_MS,
      forceRefresh
    );
  },

  /**
   * Fetch settings for a specific guild.
   */
  async getSettings(guildId: string, forceRefresh: boolean = false): Promise<GuildSettings> {
    if (!guildId) throw new Error('Guild ID is required');
    return guildCache.getOrFetch(
      `guild_${guildId}_settings`,
      () => api.get<GuildSettings>(`/api/guilds/${guildId}/settings`),
      DEFAULT_CACHE_TTL_MS,
      forceRefresh
    );
  },

  /**
   * Fetch features and limits for a specific guild.
   */
  async getFeatures(guildId: string, forceRefresh: boolean = false): Promise<GuildFeatures> {
    if (!guildId) throw new Error('Guild ID is required');
    return guildCache.getOrFetch(
      `guild_${guildId}_features`,
      () => api.get<GuildFeatures>(`/api/guilds/${guildId}/features`),
      DEFAULT_CACHE_TTL_MS,
      forceRefresh
    );
  },

  /**
   * Update settings for a specific guild and invalidate cache.
   */
  async updateSettings(guildId: string, settings: Partial<GuildSettings>): Promise<GuildSettings> {
    if (!guildId) throw new Error('Guild ID is required');
    const updated = await api.patch<GuildSettings>(`/api/guilds/${guildId}/settings`, settings);
    guildCache.invalidate(`guild_${guildId}`);
    return updated;
  },

  /**
   * Invalidate cached data for a specific guild or all guilds.
   */
  invalidateGuild(guildId: string): void {
    guildCache.invalidate(`guild_${guildId}`);
  },

  /**
   * Clear all in-memory guild cache.
   */
  clearCache(): void {
    guildCache.clear();
  }
};

export default guildService;

