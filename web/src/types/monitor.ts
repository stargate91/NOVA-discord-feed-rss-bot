export type MonitorPlatform =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'stream'
  | 'rss'
  | 'epic_games'
  | 'steam_free'
  | 'steam_news'
  | 'gog_free'
  | 'movie'
  | 'tv_series'
  | 'github'
  | 'crypto'
  | string;

export interface PlatformMetadata {
  id: MonitorPlatform;
  name: string;
  logo: string;
  color: string;
  description: string;
  isGlobal?: boolean;
  isCrypto?: boolean;
  inputLabel?: string;
  inputKey?: string;
  placeholder?: string;
  hint?: string;
}

export interface BulkPlatformMetadata {
  id: MonitorPlatform;
  name: string;
  logo: string;
  color: string;
  placeholder: string;
  hint: string;
}

export interface MonitorConfig {
  id: number;
  guild_id?: string;
  name: string;
  type: MonitorPlatform;
  enabled: boolean;
  target_channels?: string[];
  target_roles?: string[];
  ping_role?: string;
  ping_role_id?: string;
  discord_channel_id?: string;
  custom_color?: string;
  embed_color?: string;
  custom_image?: string;
  alert_template?: string;
  custom_alert?: string;
  last_check_at?: string;
  last_post_at?: string;
  created_at?: string;
  api_url?: string;
  extra_settings?: Record<string, any> | string;
  
  // Platform specific attributes
  channel_id?: string;
  username?: string;
  rss_url?: string;
  feed_url?: string;
  app_id?: string;
  appid?: string;
  repo?: string;
  repo_path?: string;
  source_id?: string;
  include_dlc?: boolean;
  selected_genres?: string[];
  target_genres?: string[];
  target_languages?: string[];
  symbols?: string[] | string;
  steam_patch_only?: boolean;
  include_upcoming?: boolean;
  use_native_player?: boolean;
  min_rating?: number;
  is_live?: boolean;
  [key: string]: any;
}

export interface CreateMonitorPayload {
  guild_id: string;
  name: string;
  type: MonitorPlatform;
  target_channels: string[];
  target_roles?: string[];
  ping_role?: string;
  custom_color?: string;
  embed_color?: string;
  custom_image?: string;
  alert_template?: string;
  channel_id?: string;
  username?: string;
  rss_url?: string;
  app_id?: string;
  repo?: string;
  source_id?: string;
  include_dlc?: boolean;
  selected_genres?: string[];
  target_genres?: string[];
  target_languages?: string[];
  min_rating?: number;
  [key: string]: any;
}

export interface BulkAddMonitorPayload {
  guild_id: string;
  type: MonitorPlatform;
  target_channels: string[];
  target_roles?: string[];
  ping_role?: string;
  custom_color?: string;
  alert_template?: string;
  items?: string[];
  sources?: string[];
  [key: string]: any;
}

export interface BulkEditMonitorPayload {
  monitor_ids: number[];
  target_channels?: string[];
  target_roles?: string[];
  ping_role?: string;
  enabled?: boolean;
  custom_color?: string;
  [key: string]: any;
}

export interface MonitorDiagnostics {
  status: 'healthy' | 'warning' | 'error';
  last_check_status: string;
  last_check_time: string | null;
  items_published_total: number;
  api_latency_ms: number | null;
  error_message?: string | null;
}

export interface GenreItem {
  id: string;
  name: string;
}

export interface LanguageItem {
  id: string;
  name: string;
}
