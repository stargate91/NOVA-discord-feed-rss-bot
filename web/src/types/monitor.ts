import type { MonitorPlatform, KnownPlatformId } from '@/constants/platforms';

export type { MonitorPlatform, KnownPlatformId };

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
  guildId: string;
  name: string;
  type: MonitorPlatform;
  target_channels: string[];
  target_roles?: string[];
  embed_color?: string;
  custom_alert?: string;
  custom_image?: string;
  include_upcoming?: boolean;
  send_initial_alert?: boolean;
  use_native_player?: boolean;
  target_genres?: string[];
  target_languages?: string[];
  symbols?: string;
  source_id?: string;
  channel_id?: string;
  username?: string;
  rss_url?: string;
  app_id?: string;
  repo?: string;
  [key: string]: any;
}

export interface UpdateMonitorPayload {
  name?: string;
  target_channels?: string[];
  target_roles?: string[];
  embed_color?: string;
  custom_alert?: string;
  custom_image?: string;
  include_upcoming?: boolean;
  send_initial_alert?: boolean;
  use_native_player?: boolean;
  target_genres?: string[];
  target_languages?: string[];
  symbols?: string;
  source_id?: string;
  steam_patch_only?: boolean;
  [key: string]: any;
}

export interface BulkAddPayload {
  guildId: string;
  type: MonitorPlatform;
  sources: string[];
  targetChannels: string[];
  targetRoles?: string[];
  embedColor?: string;
  sendInitialAlert?: boolean;
  use_native_player?: boolean;
  custom_image?: string;
  [key: string]: any;
}

export interface BulkAddResponse {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

export interface BulkEditMonitorPayload {
  monitor_ids: number[];
  target_channels?: string[];
  target_roles?: string[];
  ping_role?: string;
  enabled?: boolean;
  embed_color?: string;
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
