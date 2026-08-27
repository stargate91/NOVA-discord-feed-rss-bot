import { useApiQuery, useApiMutation, apiClient } from '@/api';
import { featureFlags } from '@/constants';
import { MOCK_FEED_MONITORS } from '../constants';
import type { FeedMonitor, CreateMonitorPayload } from '@/types';

export const useGuildFeeds = (guildId: string) => {
  const query = useApiQuery<FeedMonitor[]>(
    async (signal) => {
      if (featureFlags.useMockData) {
        return MOCK_FEED_MONITORS.filter((m) => m.guild_id === guildId || !guildId);
      }
      return apiClient.get<FeedMonitor[]>(`/api/v1/guilds/${guildId}/feeds`, { signal });
    },
    [guildId],
    { key: `guild-feeds-${guildId}`, enabled: Boolean(guildId) }
  );

  const createMutation = useApiMutation<FeedMonitor, CreateMonitorPayload>(
    async (payload) => {
      if (featureFlags.useMockData) {
        const newMonitor: FeedMonitor = {
          id: `mon-${Date.now()}`,
          guild_id: guildId,
          platform: payload.platform,
          target_id: payload.target_id,
          target_name: payload.target_id,
          destination_channel_id: payload.destination_channel_id,
          ping_role_id: payload.ping_role_id || null,
          custom_message: payload.custom_message || null,
          embed_color: payload.embed_color || null,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
        };
        return newMonitor;
      }
      return apiClient.post<FeedMonitor>(`/api/v1/guilds/${guildId}/feeds`, payload);
    },
    { invalidateKeys: [`guild-feeds-${guildId}`] }
  );

  return {
    feeds: query.data ?? (featureFlags.useMockData ? MOCK_FEED_MONITORS : []),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createFeed: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
  };
};
