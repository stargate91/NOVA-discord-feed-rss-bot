/**
 * Generates a short unique alphanumeric identifier string.
 *
 * @param prefix Optional prefix for the ID (e.g. 'toast')
 * @param length Number of random characters (default: 7)
 * @returns Formatted ID string
 */
export function generateId(prefix: string = '', length: number = 7): string {
  const randomPart = Math.random().toString(36).substring(2, 2 + length);
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}
