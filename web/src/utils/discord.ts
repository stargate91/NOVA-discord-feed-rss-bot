import { GuildInfo } from '@/types/guild';

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

/**
 * Filters and sorts Discord guilds (guilds with bot present first, then alphabetically).
 */
export function filterAndSortGuilds(
  guilds: Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>,
  searchQuery: string
): Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }> {
  const query = searchQuery.toLowerCase().trim();
  return guilds
    .filter((g) => g.name.toLowerCase().includes(query))
    .sort((a, b) => {
      const aHas = Boolean(a.hasBot || a.bot_in_guild);
      const bHas = Boolean(b.hasBot || b.bot_in_guild);
      if (aHas === bHas) return a.name.localeCompare(b.name);
      return bHas ? 1 : -1;
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



