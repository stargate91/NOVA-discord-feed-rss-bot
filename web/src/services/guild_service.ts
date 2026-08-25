import api from './api_client';
import { DiscordChannel, DiscordRole, GuildInfo, GuildSettings } from '@/types/guild';

export const guildService = {
  async getGuilds(): Promise<Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>> {
    return api.get<Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>>('/api/guilds');
  },

  async getChannels(guildId: string): Promise<DiscordChannel[]> {
    if (!guildId) return [];
    return api.get<DiscordChannel[]>(`/api/guilds/${guildId}/channels`);
  },

  async getRoles(guildId: string): Promise<DiscordRole[]> {
    if (!guildId) return [];
    return api.get<DiscordRole[]>(`/api/guilds/${guildId}/roles`);
  },

  async getSettings(guildId: string): Promise<GuildSettings> {
    if (!guildId) throw new Error('Guild ID is required');
    return api.get<GuildSettings>(`/api/guilds/${guildId}/settings`);
  },

  async updateSettings(guildId: string, settings: Partial<GuildSettings>): Promise<GuildSettings> {
    if (!guildId) throw new Error('Guild ID is required');
    return api.patch<GuildSettings>(`/api/guilds/${guildId}/settings`, settings);
  }
};

export default guildService;
