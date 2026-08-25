export interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 0 = Text, 2 = Voice, 4 = Category, 5 = Announcement, 15 = Forum
  position?: number;
  parent_id?: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions?: string;
  mentionable?: boolean;
}

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  permissions?: string;
  bot_in_guild?: boolean;
  hasBot?: boolean;
  isPremium?: boolean;
  isMaster?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  canManage?: boolean;
  member_count?: number;
  tier?: number;
  [key: string]: any;
}

export interface GuildFeatures {
  tier: number;
  tierName: string;
  isMaster: boolean;
  isPremium: boolean;
  maxMonitors: number;
  minRefreshInterval: number;
  maxPurge: number;
  maxChannels: number;
  maxPings: number;
  canCustomColor: boolean;
  canAlertTemplate: boolean;
  canCustomTemplate: boolean;
  canGenreFilter: boolean;
  canTmdbLanguageFilter: boolean;
  canRemoveBranding: boolean;
  canBulkImport: boolean;
  canBulkDelete: boolean;
  canRepost: boolean;
  features: string[];
}

export interface GuildSettings {
  guild_id?: string;
  language?: string;
  admin_role_id?: string;
  tier?: number;
  premium_until?: string | null;
  stripe_subscription_id?: string | null;
  custom_branding?: string | null;
  alert_templates?: Record<string, string>;
  is_active?: boolean;
  refresh_interval?: number;
  isMaster?: boolean;
  hasStripeSubscription?: boolean;
  features?: GuildFeatures;
  [key: string]: any;
}

export interface GuildPermissions {
  is_admin: boolean;
  tier: number;
  tier_name: string;
  features: string[];
  limits: {
    name: string;
    features: string[];
    max_monitors: number;
    check_interval: number;
    max_purge?: number;
    [key: string]: any;
  };
  bot_in_guild: boolean;
}

