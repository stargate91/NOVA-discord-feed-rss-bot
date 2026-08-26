import { useCallback } from 'react';
import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { getUserDisplayName, getUserDisplayEmail } from '@/utils/user';
import { useDropdown } from './use_dropdown';

export interface UseLoginButtonOptions {
  session?: Session | null;
  loginCallbackUrl?: string;
  logoutCallbackUrl?: string;
}

export function useLoginButton({
  session,
  loginCallbackUrl = '/servers',
  logoutCallbackUrl = '/',
}: UseLoginButtonOptions = {}) {
  const {
    isOpen,
    setIsOpen,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
  } = useDropdown();

  const displayName = session?.user ? getUserDisplayName(session.user) : '';
  const displayEmail = session?.user ? getUserDisplayEmail(session.user) : '';

  const handleLogin = useCallback(() => {
    signIn('discord', { callbackUrl: loginCallbackUrl });
  }, [loginCallbackUrl]);

  const handleLogout = useCallback(() => {
    closeDropdown();
    signOut({ callbackUrl: logoutCallbackUrl });
  }, [logoutCallbackUrl, closeDropdown]);

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    displayName,
    displayEmail,
    handleLogin,
    handleLogout,
    toggleDropdown,
    closeDropdown,
  };
}
