import { LanguageItem } from '@/types/monitor';

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { id: 'en', name: 'English' },
  { id: 'hu', name: 'Hungarian' },
  { id: 'de', name: 'German' },
  { id: 'fr', name: 'French' },
  { id: 'es', name: 'Spanish' },
  { id: 'it', name: 'Italian' },
  { id: 'pt', name: 'Portuguese' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
  { id: 'zh', name: 'Chinese' },
  { id: 'ru', name: 'Russian' },
  { id: 'tr', name: 'Turkish' },
  { id: 'pl', name: 'Polish' },
  { id: 'nl', name: 'Dutch' },
  { id: 'ar', name: 'Arabic' }
];

export const LANGUAGES = SUPPORTED_LANGUAGES;

export const BOT_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' }
];

export const DEFAULT_LANGUAGE = 'en';
