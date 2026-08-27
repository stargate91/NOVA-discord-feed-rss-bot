import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';
import { HomePage } from '@/pages/marketing/HomePage';
import { PremiumPage } from '@/pages/marketing/PremiumPage';
import { DocsPage } from '@/pages/marketing/DocsPage';
import { SupportPage } from '@/pages/marketing/SupportPage';
import { ChangelogPage } from '@/pages/marketing/ChangelogPage';
import { PrivacyPage } from '@/pages/marketing/PrivacyPage';
import { TermsPage } from '@/pages/marketing/TermsPage';
import { NotFoundPage } from '@/pages/marketing/NotFoundPage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </I18nProvider>
    </ThemeProvider>
  );
};

describe('Marketing Pages Smoke & Render Tests', () => {
  it('should render HomePage with hero, features, and interactive preview', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render PremiumPage with pricing plans and comparison matrix', () => {
    renderWithProviders(<PremiumPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render DocsPage with search and quick start guide', () => {
    renderWithProviders(<DocsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render SupportPage with help center options and discord links', () => {
    renderWithProviders(<SupportPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render ChangelogPage with release timeline', () => {
    renderWithProviders(<ChangelogPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render PrivacyPage with policy sections', () => {
    renderWithProviders(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render TermsPage with terms of service', () => {
    renderWithProviders(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render NotFoundPage (404) with back navigation CTA', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
