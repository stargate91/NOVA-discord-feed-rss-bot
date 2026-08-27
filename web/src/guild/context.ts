import { createContext } from 'react';
import type { GuildContextValue } from './types';

export const GuildContext = createContext<GuildContextValue | null>(null);
