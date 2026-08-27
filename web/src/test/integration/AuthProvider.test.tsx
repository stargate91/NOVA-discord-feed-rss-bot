import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/auth';

const AuthConsumer: React.FC = () => {
  const { user, isAuthenticated, loginWithDiscord, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? `Logged in as ${user?.username}` : 'Logged Out'}
      </span>
      <button type="button" onClick={() => loginWithDiscord()} data-testid="login-btn">
        Login
      </button>
      <button type="button" onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe('AuthProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should allow user to login and logout', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Initial state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');

    // Perform Login
    await user.click(screen.getByTestId('login-btn'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as NovaAdmin');

    // Perform Logout
    await user.click(screen.getByTestId('logout-btn'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
  });

  it('should rehydrate stored user session from localStorage on initialization', () => {
    localStorage.setItem('nova_discord_token', 'persisted_jwt_token');
    localStorage.setItem(
      'nova_auth_user',
      JSON.stringify({
        id: '999999999999999999',
        username: 'PersistentUser',
        discriminator: '1337',
        avatar: '/images/user.webp',
      })
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as PersistentUser');
  });

  it('should invalidate session on mount if token is expired and no refresh token exists', () => {
    localStorage.setItem('nova_discord_token', 'expired_token');
    localStorage.setItem('nova_auth_expires_at', String(Date.now() - 10000));
    localStorage.setItem(
      'nova_auth_user',
      JSON.stringify({
        id: '111',
        username: 'OldUser',
        discriminator: '0001',
        avatar: '/avatar.webp',
      })
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(localStorage.getItem('nova_discord_token')).toBeNull();
  });
});
