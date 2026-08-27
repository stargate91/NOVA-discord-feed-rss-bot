export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  global_name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: DiscordUser | null;
  adminSecret: string | null;
}

export interface AuthContextValue extends AuthState {
  loginWithDiscord: (redirectUri?: string) => void;
  mockLogin: () => void;
  logout: () => void;
  setAdminSecretKey: (secret: string) => void;
  clearAdminSecretKey: () => void;
}

// Re-export UserGuild from guild domain for compatibility
export type { UserGuild } from '@/guild/types';
