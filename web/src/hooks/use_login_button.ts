import { useState, useRef, useCallback } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { getUserDisplayName, getUserDisplayEmail } from '@/utils/user';
import { useClickOutside } from './use_click_outside';

export interface UseLoginButtonOptions {
  session?: any;
  loginCallbackUrl?: string;
  logoutCallbackUrl?: string;
}

export function useLoginButton({
  session,
  loginCallbackUrl = '/servers',
  logoutCallbackUrl = '/',
}: UseLoginButtonOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const displayName = session?.user ? getUserDisplayName(session.user) : '';
  const displayEmail = session?.user ? getUserDisplayEmail(session.user) : '';

  const handleLogin = useCallback(() => {
    signIn('discord', { callbackUrl: loginCallbackUrl });
  }, [loginCallbackUrl]);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    signOut({ callbackUrl: logoutCallbackUrl });
  }, [logoutCallbackUrl]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

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
