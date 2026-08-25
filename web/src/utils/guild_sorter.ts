import { GuildInfo } from '@/types/guild';

export function filterAndSortGuilds(
  guilds: Array<GuildInfo & { hasBot?: boolean }>,
  searchQuery: string
): Array<GuildInfo & { hasBot?: boolean }> {
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
