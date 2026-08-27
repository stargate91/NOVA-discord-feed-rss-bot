import { createContext } from 'react';
import type { ThemeContextValue } from './types';

export const THEME_STORAGE_KEY = 'nova_theme_preference';
export const ThemeContext = createContext<ThemeContextValue | null>(null);
