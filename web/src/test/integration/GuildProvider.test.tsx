import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/auth';
import { GuildProvider, useGuild } from '@/guild';

const GuildConsumer: React.FC = () => {
  const { loginWithDiscord, logout } = useAuth();
  const { guilds, activeGuild, selectGuild, checkGuildPermission } = useGuild();

  return (
    <div>
      <span data-testid="guilds-count">{guilds.length}</span>
      <span data-testid="active-guild-name">{activeGuild?.name ?? 'None'}</span>
      <span data-testid="active-guild-tier">{activeGuild?.tier ?? 'None'}</span>
      <span data-testid="permission-check-known">
        {checkGuildPermission('123456789012345678') ? 'Permitted' : 'Denied'}
      </span>
      <span data-testid="permission-check-unknown">
        {checkGuildPermission('unauthorized_server_999') ? 'Permitted' : 'Denied'}
      </span>
      <button type="button" onClick={() => loginWithDiscord()} data-testid="login-btn">
        Login
      </button>
      <button type="button" onClick={logout} data-testid="logout-btn">
        Logout
      </button>
      <button
        type="button"
        onClick={() => selectGuild('987654321098765432')}
        data-testid="select-guild-2"
      >
        Select Guild 2
      </button>
    </div>
  );
};

describe('GuildProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load guilds when authenticated and enforce strict permissions', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <GuildProvider>
          <GuildConsumer />
        </GuildProvider>
      </AuthProvider>
    );

    // Initial state (Logged Out)
    expect(screen.getByTestId('guilds-count')).toHaveTextContent('0');
    expect(screen.getByTestId('active-guild-name')).toHaveTextContent('None');
    expect(screen.getByTestId('permission-check-unknown')).toHaveTextContent('Denied');

    // Login
    await user.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('guilds-count')).toHaveTextContent('2');
    expect(screen.getByTestId('active-guild-name')).toHaveTextContent('Stargate Gaming Lounge');
    expect(screen.getByTestId('active-guild-tier')).toHaveTextContent('professional');
    expect(screen.getByTestId('permission-check-known')).toHaveTextContent('Permitted');
    // Unauthorized server is strictly Denied
    expect(screen.getByTestId('permission-check-unknown')).toHaveTextContent('Denied');

    // Select different guild
    await user.click(screen.getByTestId('select-guild-2'));
    expect(screen.getByTestId('active-guild-name')).toHaveTextContent('Creator Hub VIP');
    expect(screen.getByTestId('active-guild-tier')).toHaveTextContent('ultimate');

    // Logout
    await user.click(screen.getByTestId('logout-btn'));
    expect(screen.getByTestId('guilds-count')).toHaveTextContent('0');
    expect(screen.getByTestId('active-guild-name')).toHaveTextContent('None');
  });
});
