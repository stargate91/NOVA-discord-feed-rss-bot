import { GuildInfo } from '@/types/guild';

/**
 * Sanitizes and normalizes a Discord ID (removes hyphens, non-numeric characters, and whitespace).
 */
export function sanitizeDiscordId(id: string | number | null | undefined): string {
  if (id === null || id === undefined) return '';
  return String(id).replace(/[^0-9]/g, '').trim();
}

export const sanitizeGuildId = sanitizeDiscordId;
export const cleanDiscordId = sanitizeDiscordId;

/**
 * Generates Discord Guild Icon URL from guild ID and icon hash.
 */
export function getGuildIconUrl(guildId: string, iconHash: string | null, size = 64): string | null {
  if (!iconHash) return null;
  const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}

/**
 * Generates Discord User Avatar URL.
 */
export function getUserAvatarUrl(userId: string, avatarHash: string | null, size = 64): string {
  if (!avatarHash) return 'https://cdn.discordapp.com/embed/avatars/0.png';
  const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}

/**
 * Generates Discord Bot OAuth2 Invite URL.
 */
export function getBotInviteUrl(guildId?: string): string {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1489908793780338688';
  const permissions = '3387582172359760';
  const redirectUri = encodeURIComponent('https://novafeeds.xyz/api/auth/callback/discord');
  const scope = encodeURIComponent('identify guilds bot applications.commands');

  let url = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&response_type=code&redirect_uri=${redirectUri}&integration_type=0&scope=${scope}`;
  if (guildId) {
    url += `&guild_id=${guildId}`;
  }
  return url;
}

/**
 * Converts a Discord integer color to a hex string (e.g. 0x5865F2 -> "#5865f2").
 */
export function discordColorToHex(color?: number | null, fallback = 'var(--text-muted)'): string {
  if (!color || color === 0) return fallback;
  return `#${color.toString(16).padStart(6, '0')}`;
}

/**
 * Extracts 1-2 letter uppercase initials from a guild/server name.
 */
export function getGuildInitials(name?: string, maxLength = 2): string {
  if (!name || typeof name !== 'string') return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, maxLength).toUpperCase();
  }
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, maxLength)
    .toUpperCase();
}

export interface EnrichedGuildInfo extends GuildInfo {
  hasBot: boolean;
  bot_in_guild: boolean;
  botInviteUrl: string;
}

/**
 * Normalizes guild info ensuring boolean hasBot/bot_in_guild and valid botInviteUrl.
 */
export function normalizeGuildInfo(
  guild: GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }
): EnrichedGuildInfo {
  const hasBot = Boolean(guild.hasBot || guild.bot_in_guild);
  return {
    ...guild,
    hasBot,
    bot_in_guild: hasBot,
    botInviteUrl: getBotInviteUrl(guild.id),
  };
}

/**
 * Filters and sorts Discord guilds (guilds with bot present first, then alphabetically).
 */
export function filterAndSortGuilds(
  guilds: Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>,
  searchQuery: string
): EnrichedGuildInfo[] {
  const query = searchQuery.toLowerCase().trim();
  return guilds
    .map(normalizeGuildInfo)
    .filter((g) => g.name.toLowerCase().includes(query))
    .sort((a, b) => {
      if (a.hasBot === b.hasBot) return a.name.localeCompare(b.name);
      return b.hasBot ? 1 : -1;
    });
}

/**
 * Formats Discord channels into standard MultiSelect option format with '#' prefix.
 */
export interface DiscordSelectOption {
  id: string;
  name: string;
}

export function formatChannelOptions(
  channels: Array<{ id: string; name: string }> = []
): DiscordSelectOption[] {
  return channels.map((c) => ({
    id: c.id,
    name: c.name.startsWith('#') ? c.name : `#${c.name}`,
  }));
}

/**
 * Formats Discord roles into standard MultiSelect option format.
 */
export function formatRoleOptions(
  roles: Array<{ id: string; name: string }> = []
): DiscordSelectOption[] {
  return roles.map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

/**
 * Discord Permissions Bitfield Constants
 */
export const DISCORD_PERMISSIONS = {
  ADMINISTRATOR: 0x8n, // 8n (1n << 3n)
  MANAGE_GUILD: 0x20n, // 32n (1n << 5n)
  MANAGE_CHANNELS: 0x10n, // 16n (1n << 4n)
  VIEW_AUDIT_LOG: 0x80n, // 128n (1n << 7n)
  MANAGE_WEBHOOKS: 0x20000000n, // 536870912n (1n << 29n)
} as const;

export interface GuildPermissionFlags {
  isOwner: boolean;
  isAdmin: boolean;
  isManageGuild: boolean;
  isManageChannels: boolean;
  isManageWebhooks: boolean;
  isAuditLog: boolean;
  canManage: boolean;
}

/**
 * Parses Discord permissions bitfield and checks if user has server management access.
 */
export function parseGuildPermissions(
  permissions: string | number | bigint | undefined | null,
  isOwner: boolean = false
): GuildPermissionFlags {
  if (isOwner) {
    return {
      isOwner: true,
      isAdmin: true,
      isManageGuild: true,
      isManageChannels: true,
      isManageWebhooks: true,
      isAuditLog: true,
      canManage: true,
    };
  }

  let perms = 0n;
  try {
    perms = BigInt(permissions || '0');
  } catch {
    perms = 0n;
  }

  const isAdmin = (perms & DISCORD_PERMISSIONS.ADMINISTRATOR) === DISCORD_PERMISSIONS.ADMINISTRATOR;
  const isManageGuild = (perms & DISCORD_PERMISSIONS.MANAGE_GUILD) === DISCORD_PERMISSIONS.MANAGE_GUILD;
  const isManageChannels = (perms & DISCORD_PERMISSIONS.MANAGE_CHANNELS) === DISCORD_PERMISSIONS.MANAGE_CHANNELS;
  const isManageWebhooks = (perms & DISCORD_PERMISSIONS.MANAGE_WEBHOOKS) === DISCORD_PERMISSIONS.MANAGE_WEBHOOKS;
  const isAuditLog = (perms & DISCORD_PERMISSIONS.VIEW_AUDIT_LOG) === DISCORD_PERMISSIONS.VIEW_AUDIT_LOG;

  const canManage = isOwner || isAdmin || isManageGuild || isManageChannels || isManageWebhooks || isAuditLog;

  return {
    isOwner,
    isAdmin,
    isManageGuild,
    isManageChannels,
    isManageWebhooks,
    isAuditLog,
    canManage,
  };
}

/**
 * Checks if a user has permission to manage a Discord server.
 */
export function hasGuildManagementPermission(
  permissions: string | number | bigint | undefined | null,
  isOwner: boolean = false
): boolean {
  return parseGuildPermissions(permissions, isOwner).canManage;
}
