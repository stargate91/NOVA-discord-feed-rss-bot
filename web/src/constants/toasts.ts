export const TOAST_CONFIG = {
  AUTO_REMOVE_DELAY_MS: 5000,
  SUCCESS_OVERLAY_DURATION_MS: 2000,
  DEFAULT_TYPE: 'info' as const,
} as const;

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export const AUTH_ERROR_TOASTS: Record<string, { message: string; title: string }> = {
  auth_cancelled: {
    title: 'Sign In Cancelled',
    message: 'The authentication process was cancelled.',
  },
  auth_error: {
    title: 'Authentication Error',
    message: 'An error occurred during authentication. Please try again.',
  },
  AccessDenied: {
    title: 'Access Denied',
    message: 'You do not have permission to sign in.',
  },
  OAuthCallback: {
    title: 'Authentication Failed',
    message: 'Could not complete the Discord OAuth login.',
  },
  Configuration: {
    title: 'Server Configuration Error',
    message: 'Authentication service is misconfigured. Please contact support.',
  },
};

export const TOAST_MESSAGES = {
  MONITOR: {
    CREATE_SUCCESS: (name: string) => `Created ${name} monitor successfully!`,
    CREATE_ERROR: 'Failed to create monitor',
    UPDATE_SUCCESS: 'Monitor updated successfully',
    UPDATE_ERROR: 'Failed to update monitor',
    DELETE_SUCCESS: 'Monitor deleted successfully',
    DELETE_ERROR: 'Failed to delete monitor',
    TOGGLE_SUCCESS: (enabled: boolean) => `Monitor ${enabled ? 'resumed' : 'paused'}`,
    TOGGLE_ERROR: 'Failed to update monitor status',
    BULK_UPDATE_SUCCESS: 'Monitors updated successfully',
    BULK_UPDATE_ERROR: 'Failed to bulk update monitors',
    BULK_ADD_ERROR: 'Failed to process bulk add.',
    BULK_DELETE_SUCCESS: 'Selected monitors deleted',
    BULK_DELETE_ERROR: 'Failed to delete monitors',
    BULK_TOGGLE_SUCCESS: (count: number, enabled: boolean) =>
      `${count} monitor(s) ${enabled ? 'resumed' : 'paused'}`,
    BULK_LOCKED: 'Bulk editing requires Professional Tier (Tier 2) or higher.',
    NO_CHANGES: 'Please select at least one field to update.',
    VALIDATION_ERROR: 'Please check your inputs and try again.',
    SYNC_ERROR: 'Failed to sync server data',
    YOUTUBE_RESOLVED: (title: string) => `Found: ${title}`,
    YOUTUBE_NOT_FOUND: 'Could not find YouTube channel. Check the name/link.',
  },
  DEV: {
    TIER_UPDATED: 'Simulated tier updated',
    TIER_RESET: 'Tier simulation reset to real tier',
    KEY_GENERATED: 'New premium key generated!',
    KEY_GENERATE_ERROR: 'Failed to generate key',
    KEY_DELETED: 'Key deleted',
    KEY_DELETE_ERROR: 'Failed to delete key',
    KEY_REVOKED: 'Key revoked',
    KEY_REVOKE_ERROR: 'Failed to revoke key',
    STATUS_ADDED: 'Status pattern added',
    STATUS_ADD_ERROR: 'Failed to add status pattern',
    STATUS_DELETED: 'Status pattern removed',
    STATUS_DELETE_ERROR: 'Failed to delete status pattern',
    ANNOUNCEMENT_SENT: 'Announcement broadcasted!',
    ANNOUNCEMENT_SEND_ERROR: 'Failed to broadcast announcement',
    ANNOUNCEMENT_DELETED: 'Announcement removed',
    ANNOUNCEMENT_DELETE_ERROR: 'Failed to delete announcement',
    RESET_COMPLETED: 'Nuclear reset completed',
    RESET_ERROR: 'Failed to complete reset',
    COPIED_CLIPBOARD: 'Copied to clipboard!',
    ACTION_FAILED: 'Action failed',
    LOAD_ERROR: 'Failed to load developer data',
  },
  TEMPLATE: {
    SAVE_SUCCESS: 'Template configuration saved!',
    SAVE_ERROR: 'Failed to save template configuration',
    RESET_SUCCESS: 'Templates reset to defaults',
    COPIED: 'Variable copied to clipboard',
  },
  SETTINGS: {
    UPDATE_SUCCESS: 'Settings updated successfully!',
    UPDATE_ERROR: 'Failed to update settings',
    PORTAL_ERROR: 'Failed to open billing portal',
    REDEEM_SUCCESS: 'Promo code activated successfully!',
    REDEEM_ERROR: 'Failed to redeem promo code',
  },
  BILLING: {
    CHECKOUT_ERROR: 'An error occurred during checkout.',
    PORTAL_ERROR: 'Failed to open billing portal',
    CONFIG_ERROR: 'Failed to load billing configuration',
  },
} as const;



