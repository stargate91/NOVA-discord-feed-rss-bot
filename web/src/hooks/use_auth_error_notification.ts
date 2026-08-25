import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/context/toast_context';

export const AUTH_ERROR_MESSAGES: Record<string, { message: string; title: string }> = {
  auth_cancelled: {
    message: 'A bejelentkezés megszakítva.',
    title: 'Bejelentkezés',
  },
  auth_error: {
    message: 'Hiba történt a bejelentkezés során.',
    title: 'Hiba',
  },
};

export function useAuthErrorNotification() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const errorKey = searchParams?.get('error');
    if (!errorKey) return;

    const errorConfig = AUTH_ERROR_MESSAGES[errorKey];
    if (errorConfig) {
      addToast(errorConfig.message, 'error', errorConfig.title);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, addToast]);
}
