import type { SupportedLocale } from './types';

/**
 * Recursively flattens nested dictionary structures into dot-notation string keys.
 * E.g. { home: { hero: { title: "Hello" } } } -> { "home.hero.title": "Hello" }
 */
export const flattenDictionary = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> => {
  const result: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[prefixedKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenDictionary(value as Record<string, unknown>, prefixedKey));
    }
  });

  return result;
};

/**
 * Resolves ICU LDML Plural Category ('zero' | 'one' | 'two' | 'few' | 'many' | 'other')
 * using native Intl.PluralRules.
 */
export const getPluralCategory = (locale: SupportedLocale, count: number): Intl.LDMLPluralRule => {
  try {
    return new Intl.PluralRules(locale).select(count);
  } catch {
    // Fallback plural rule if browser fails to initialize PluralRules
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    return 'other';
  }
};
