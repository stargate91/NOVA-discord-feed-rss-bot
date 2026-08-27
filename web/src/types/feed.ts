export type FeedPlatform =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'epic_games'
  | 'steam'
  | 'steam_deals'
  | 'tmdb'
  | 'rss'
  | 'github'
  | 'gog';

export type FeedMonitorStatus = 'active' | 'paused' | 'error' | 'rate_limited' | 'dead_channel';

export interface FeedMonitor {
  id: string;
  guild_id: string;
  platform: FeedPlatform;
  target_id: string;
  target_name?: string;
  destination_channel_id: string;
  destination_channel_name?: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
  status: FeedMonitorStatus;
  last_checked_at?: string | null;
  last_posted_at?: string | null;
  error_message?: string | null;
  consecutive_failures?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorPayload {
  platform: FeedPlatform;
  target_id: string;
  destination_channel_id: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
}

export interface UpdateMonitorPayload {
  destination_channel_id?: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
  status?: FeedMonitorStatus;
}
