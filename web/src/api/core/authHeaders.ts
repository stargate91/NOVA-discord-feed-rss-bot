import { AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from '@/auth/context';

/**
 * Reads a cookie value by name.
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export interface AuthHeadersParams {
  authToken: string | null;
  adminSecret: string | null;
  csrfToken: string | null;
  method: string;
}

/**
 * Constructs required security headers (Bearer token, Webhook Secret, CSRF Token).
 */
export const buildAuthHeaders = ({
  authToken,
  adminSecret,
  csrfToken,
  method,
}: AuthHeadersParams): Record<string, string> => {
  const headers: Record<string, string> = {};

  // 1. Authorization Header (Bearer token)
  const effectiveToken =
    authToken ||
    (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);

  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  // 2. Admin Webhook Secret Header (supports sessionStorage / in-memory override)
  const effectiveSecret =
    adminSecret ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem(ADMIN_SECRET_KEY) || localStorage.getItem(ADMIN_SECRET_KEY)
      : null);

  if (effectiveSecret) {
    headers['X-Webhook-Secret'] = effectiveSecret;
  }

  // 3. CSRF Protection Header for mutating HTTP methods
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutatingMethods.includes(method.toUpperCase())) {
    const csrf = csrfToken || getCookie('nova_csrf') || getCookie('csrftoken');
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  return headers;
};
