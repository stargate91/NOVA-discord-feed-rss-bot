import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme, ThemeToggle } from '@/theme';
import { I18nProvider } from '@/i18n';

const ThemeConsumer: React.FC = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{resolvedTheme}</span>
      <ThemeToggle />
    </div>
  );
};

describe('ThemeProvider Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with dark theme by default and toggle between dark and light', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>
      </I18nProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const toggleBtn = screen.getByRole('button');
    await user.click(toggleBtn);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
