import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function resolveAuthErrorType(error: string | null | undefined): 'auth_cancelled' | 'auth_error' {
  return error === 'Callback' ? 'auth_cancelled' : 'auth_error';
}

export interface UseAuthErrorRedirectOptions {
  destination?: string;
}

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
