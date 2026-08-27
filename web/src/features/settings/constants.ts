import type { SelectOption } from '@/ui';
import type { GuildSettings } from '@/types';

export const GUILD_LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English (US)' },
  { value: 'hu', label: 'Magyar (Hungarian)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'zh', label: '简体中文 (Simplified Chinese)' },
  { value: 'zh-tw', label: '繁體中文 (Traditional Chinese)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'cs', label: 'Čeština (Czech)' },
  { value: 'sv', label: 'Svenska (Swedish)' },
];

export const GUILD_TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'Europe/Budapest', label: 'Europe/Budapest (CET / CEST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT / BST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET / CEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST / EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST / PDT)' },
];

export const DEFAULT_GUILD_SETTINGS: GuildSettings = {
  guild_id: '123456789012345678',
  language: 'en',
  timezone: 'UTC',
  log_channel_id: '123456789',
  auto_isolate_dead_channels: true,
  debug_logging_enabled: false,
};
