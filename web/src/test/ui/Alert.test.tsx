import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '@/ui';

describe('Alert UI Component Tests', () => {
  it('should render alert with title and message', () => {
    render(
      <Alert variant="warning" title="Warning Header">
        Cautionary message details.
      </Alert>
    );

    expect(screen.getByText('Warning Header')).toBeInTheDocument();
    expect(screen.getByText('Cautionary message details.')).toBeInTheDocument();
  });

  it('should trigger onClose callback when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Alert variant="danger" title="Error" closable onClose={handleClose}>
        Dismissible error alert.
      </Alert>
    );

    const closeBtn = screen.getByRole('button', { name: /close|dismiss/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
