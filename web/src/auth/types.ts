import type { GuildTier } from './entitlements';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  global_name?: string;
}

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  hasManagePermission: boolean;
  tier?: GuildTier;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: DiscordUser | null;
  guilds: UserGuild[];
  adminSecret: string | null;
}

export interface AuthContextValue extends AuthState {
  loginWithDiscord: () => void;
  logout: () => void;
  setAdminSecretKey: (secret: string) => void;
  clearAdminSecretKey: () => void;
  checkGuildPermission: (guildId: string) => boolean;
}
