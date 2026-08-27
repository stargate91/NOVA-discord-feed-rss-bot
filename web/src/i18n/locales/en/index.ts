import { common } from './common';
import { home } from './home';
import { premium } from './premium';
import { docs } from './docs';
import { support } from './support';
import { changelog } from './changelog';
import { legal } from './legal';
import { servers } from './servers';
import { guild } from './guild';
import { dev } from './dev';

// Helper to prefix namespace keys: prefixObj('home', home) -> { 'home.heroTitle': '...' }
const prefixObj = <P extends string, T extends Record<string, string>>(
  prefix: P,
  obj: T
): { [K in keyof T as `${P}.${string & K}`]: T[K] } => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[`${prefix}.${key}`] = value;
  }
  return result as { [K in keyof T as `${P}.${string & K}`]: T[K] };
};

export const en = {
  ...prefixObj('common', common),
  ...prefixObj('home', home),
  ...prefixObj('premium', premium),
  ...prefixObj('docs', docs),
  ...prefixObj('support', support),
  ...prefixObj('changelog', changelog),
  ...prefixObj('legal', legal),
  ...prefixObj('servers', servers),
  ...prefixObj('guild', guild),
  ...prefixObj('dev', dev),
} as const;

export type TranslationKey = keyof typeof en;

