import { useContext } from 'react';
import { AuthContext } from './context';
import type { AuthContextValue } from './types';

const defaultAuthContextValue: AuthContextValue = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  adminSecret: null,
  error: null,
  loginWithDiscord: () => {},
  mockLogin: () => {},
  logout: () => {},
  setAdminSecretKey: () => {},
  clearAdminSecretKey: () => {},
  rehydrateSession: async () => {},
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  return context || defaultAuthContextValue;
};
