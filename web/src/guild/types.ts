import type { GuildTier } from '@/auth/entitlements';

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  hasManagePermission: boolean;
  tier?: GuildTier;
  monitorsCount?: number;
}

export interface GuildState {
  guilds: UserGuild[];
  activeGuildId: string | null;
  isLoadingGuilds: boolean;
}

export interface GuildContextValue extends GuildState {
  activeGuild: UserGuild | null;
  setGuilds: (guilds: UserGuild[]) => void;
  selectGuild: (guildId: string | null) => void;
  checkGuildPermission: (guildId: string) => boolean;
  getGuildById: (guildId: string) => UserGuild | undefined;
}
