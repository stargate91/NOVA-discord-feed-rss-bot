import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/toast_context';
import { AUTH_ERROR_TOASTS } from '@/constants/toasts';

/**
 * Normalizes raw auth error query strings into standardized auth error keys.
 */
export function resolveAuthErrorType(error: string | null | undefined): string {
  if (!error) return 'auth_error';
  if (error === 'Callback' || error === 'OAuthCallback') return 'auth_cancelled';
  if (error === 'AccessDenied') return 'AccessDenied';
  if (error === 'Configuration') return 'Configuration';
  return error in AUTH_ERROR_TOASTS ? error : 'auth_error';
}

/**
 * Automatically inspects URL error query parameter and dispatches error toast notification.
 */
export function useAuthErrorNotification() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const errorKey = searchParams?.get('error');
    if (!errorKey) return;

    const errorConfig = AUTH_ERROR_TOASTS[errorKey] || AUTH_ERROR_TOASTS.auth_error;
    if (errorConfig) {
      addToast(errorConfig.message, 'error', errorConfig.title);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, addToast]);
}

export interface UseAuthErrorRedirectOptions {
  destination?: string;
}

/**
 * Handles redirecting auth error query states to target destination.
 */
export function useAuthErrorRedirect(options: UseAuthErrorRedirectOptions = {}) {
  const { destination = '/' } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    const errorType = resolveAuthErrorType(error);
    router.push(`${destination}?error=${errorType}`);
  }, [router, error, destination]);

  return {
    error,
    errorType: resolveAuthErrorType(error),
  };
}
