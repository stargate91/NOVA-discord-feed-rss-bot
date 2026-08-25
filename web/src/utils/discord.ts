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
