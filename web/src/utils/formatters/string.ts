/**
 * Truncate a string to maximum length with ellipsis.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
};
