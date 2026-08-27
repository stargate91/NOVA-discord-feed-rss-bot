import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../auth';

const AuthConsumer: React.FC = () => {
  const { user, isAuthenticated, loginWithDiscord, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? `Logged in as ${user?.username}` : 'Logged Out'}
      </span>
      <button type="button" onClick={loginWithDiscord} data-testid="login-btn">
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
});
