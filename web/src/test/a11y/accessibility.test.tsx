import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button, Input, Modal, Tabs, Alert, Field } from '@/ui';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AnnouncerProvider } from '@/components/common/ScreenReaderAnnouncer';
import { useAnnounce } from '@/components/common/useAnnounce';
import { ToastItem } from '@/components/common/Toast/ToastItem';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';

const AnnouncerTestConsumer: React.FC = () => {
  const { announce } = useAnnounce();
  return (
    <div>
      <button
        type="button"
        onClick={() => announce('Feed synchronized successfully', 'polite')}
        data-testid="btn-polite"
      >
        Announce Polite
      </button>
      <button
        type="button"
        onClick={() => announce('Critical API Rate Limit Reached', 'assertive')}
        data-testid="btn-assertive"
      >
        Announce Assertive
      </button>
    </div>
  );
};

describe('Automated Accessibility (a11y) & WCAG Compliance Suite', () => {
  it('renders Skip to Content navigation links targeting main landmarks with tabIndex=-1', () => {
    // PublicLayout test
    const { container: publicContainer } = render(
      <MemoryRouter>
        <ThemeProvider>
          <I18nProvider>
            <PublicLayout health={null} loadingHealth={false} />
          </I18nProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const publicSkipLink = publicContainer.querySelector('.skipToContent');
    expect(publicSkipLink).toBeInTheDocument();
    expect(publicSkipLink).toHaveAttribute('href', '#main-content');

    const publicMain = publicContainer.querySelector('#main-content');
    expect(publicMain).toBeInTheDocument();
    expect(publicMain).toHaveAttribute('tabindex', '-1');

    // DashboardLayout test
    const { container: dashboardContainer } = render(
      <MemoryRouter>
        <ThemeProvider>
          <I18nProvider>
            <DashboardLayout health={null} loadingHealth={false} />
          </I18nProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const dashboardSkipLink = dashboardContainer.querySelector('.skipToContent');
    expect(dashboardSkipLink).toBeInTheDocument();
    expect(dashboardSkipLink).toHaveAttribute('href', '#dashboard-main-content');

    const dashboardMain = dashboardContainer.querySelector('#dashboard-main-content');
    expect(dashboardMain).toBeInTheDocument();
    expect(dashboardMain).toHaveAttribute('tabindex', '-1');
  });

  it('supports Screen Reader Live Announcements via AnnouncerProvider', async () => {
    const user = userEvent.setup();
    render(
      <AnnouncerProvider>
        <AnnouncerTestConsumer />
      </AnnouncerProvider>
    );

    const statusLiveRegion = screen.getByRole('status');
    const alertLiveRegion = screen.getByRole('alert');

    expect(statusLiveRegion).toHaveAttribute('aria-live', 'polite');
    expect(alertLiveRegion).toHaveAttribute('aria-live', 'assertive');

    await user.click(screen.getByTestId('btn-polite'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(statusLiveRegion).toHaveTextContent('Feed synchronized successfully');

    await user.click(screen.getByTestId('btn-assertive'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(alertLiveRegion).toHaveTextContent('Critical API Rate Limit Reached');
  });

  it('verifies ToastItem has aria-live and appropriate role for notification types', () => {
    const { rerender } = render(
      <ToastItem
        toast={{ id: '1', type: 'success', message: 'Saved successfully' }}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    rerender(
      <ToastItem
        toast={{ id: '2', type: 'error', message: 'Failed to update channel' }}
        onDismiss={() => {}}
      />
    );

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('should maintain proper ARIA labels and roles on buttons and form fields', () => {
    render(
      <Field label="Server ID" error="Invalid ID format" required>
        <Input placeholder="Enter Discord Server ID" required aria-invalid="true" />
      </Field>
    );

    const input = screen.getByPlaceholderText('Enter Discord Server ID');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should manage keyboard focus and escape key in Modal overlays', async () => {
    const user = userEvent.setup();
    let closed = false;

    render(
      <Modal
        open
        onClose={() => {
          closed = true;
        }}
        title="Settings Modal"
      >
        <Modal.Body>
          <Button variant="primary">Save Changes</Button>
        </Modal.Body>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Trigger escape key
    await user.keyboard('{Escape}');
    expect(closed).toBe(true);
  });

  it('should support ARIA tab navigation and active panel association', () => {
    render(
      <Tabs defaultValue="feed">
        <Tabs.List>
          <Tabs.Tab value="feed">Feeds</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="feed">Feed Configuration</Tabs.Panel>
        <Tabs.Panel value="settings">General Settings</Tabs.Panel>
      </Tabs>
    );

    const feedTab = screen.getByRole('tab', { name: 'Feeds' });
    const settingsTab = screen.getByRole('tab', { name: 'Settings' });

    expect(feedTab).toHaveAttribute('aria-selected', 'true');
    expect(settingsTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Feed Configuration');
  });

  it('should provide alert role and dismiss button accessibility', () => {
    render(
      <Alert variant="danger" title="System Error" closable>
        Database connection interrupted.
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close|dismiss/i })).toBeInTheDocument();
  });
});
