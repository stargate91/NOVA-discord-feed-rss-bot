import { useContext } from 'react';
import { GuildContext } from './context';
import type { GuildContextValue } from './types';

export const useGuild = (): GuildContextValue => {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
};
