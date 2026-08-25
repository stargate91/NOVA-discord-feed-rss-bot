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
