/**
 * Resolves user display name with fallbacks.
 */
export function getUserDisplayName(user?: { name?: string | null; email?: string | null }): string {
  if (!user) return 'User';
  return user.name || user.email || 'User';
}

/**
 * Resolves user email or status label.
 */
export function getUserDisplayEmail(user?: { email?: string | null }): string {
  return user?.email || 'Logged in';
}
