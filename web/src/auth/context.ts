import { createContext } from 'react';
import type { AuthContextValue } from './types';

export const AUTH_TOKEN_KEY = 'nova_discord_token';
export const ADMIN_SECRET_KEY = 'nova_admin_secret';

export const AuthContext = createContext<AuthContextValue | null>(null);
