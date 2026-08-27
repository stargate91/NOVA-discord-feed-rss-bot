// LRU/Map formatter caches to avoid expensive repeated constructor calls
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>();

export function getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

export function getDateTimeFormatter(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = dateTimeFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

export function getRelativeTimeFormatter(
  locale: string,
  options?: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = relativeTimeFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options });
    relativeTimeFormatCache.set(key, formatter);
  }
  return formatter;
}
