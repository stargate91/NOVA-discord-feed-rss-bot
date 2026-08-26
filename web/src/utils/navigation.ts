/**
 * Builds a route URL for guild-scoped dashboard views.
 * Falls back to /servers if no guildId is available.
 */
export function getGuildDashboardRoute(guildId?: string, subpath: string = ''): string {
  if (!guildId) {
    return subpath ? `/${subpath}` : '/servers';
  }
  const cleanSubpath = subpath.replace(/^\//, '');
  return cleanSubpath ? `/dashboard/${guildId}/${cleanSubpath}` : `/dashboard/${guildId}`;
}

/**
 * Calculates the destination route when switching between guilds,
 * preserving the active subpath (e.g. /monitors, /settings) if applicable.
 */
export function switchGuildRoute(targetGuildId: string, currentPathname?: string): string {
  if (targetGuildId === 'global' || !targetGuildId) {
    return '/servers';
  }

  if (currentPathname && currentPathname.startsWith('/dashboard/')) {
    const segments = currentPathname.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[0] === 'dashboard') {
      const subpath = segments.slice(2).join('/');
      return getGuildDashboardRoute(targetGuildId, subpath);
    }
  }

  return getGuildDashboardRoute(targetGuildId);
}
