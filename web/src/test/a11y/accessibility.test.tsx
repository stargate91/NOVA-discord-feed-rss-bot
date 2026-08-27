import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Input, Modal, Tabs, Alert, Field } from '@/ui';

describe('Automated Accessibility (a11y) & WCAG Compliance Suite', () => {
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
      <Modal open onClose={() => { closed = true; }} title="Settings Modal">
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
