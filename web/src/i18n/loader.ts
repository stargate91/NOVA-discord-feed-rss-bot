import type { SupportedLocale } from './types';
import { en } from './locales/en';
import { flattenDictionary } from './utils';

// In-memory cache for loaded locale dictionaries
const loadedLocalesCache: Partial<Record<SupportedLocale, Record<string, string>>> = {
  en: flattenDictionary(en),
};

/**
 * Dynamically loads a locale dictionary chunk on-demand.
 * English is bundled by default; non-English locales are loaded asynchronously.
 */
export const loadLocaleDictionary = async (
  locale: SupportedLocale
): Promise<Record<string, string>> => {
  if (loadedLocalesCache[locale]) {
    return loadedLocalesCache[locale]!;
  }

  try {
    let dict: Record<string, string> = en;
    try {
      // Dynamic import for non-English locales
      const module = await import(`./locales/${locale}/index.ts`);
      if (module && module[locale]) {
        dict = flattenDictionary(module[locale]);
      }
    } catch {
      // If locale file does not exist yet, fallback to en
      dict = en;
    }

    loadedLocalesCache[locale] = dict;
    return dict;
  } catch {
    return en;
  }
};
