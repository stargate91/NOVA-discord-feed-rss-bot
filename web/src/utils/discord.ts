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
