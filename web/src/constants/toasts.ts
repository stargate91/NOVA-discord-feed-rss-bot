export const TOAST_CONFIG = {
  AUTO_REMOVE_DELAY_MS: 5000,
  SUCCESS_OVERLAY_DURATION_MS: 2000,
  DEFAULT_TYPE: 'info' as const,
} as const;

export type ToastType = 'info' | 'success' | 'error' | 'warning';
