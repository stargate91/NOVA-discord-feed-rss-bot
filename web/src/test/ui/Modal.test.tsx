import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/ui';

describe('Modal Component', () => {
  it('should not render when open is false', () => {
    render(
      <Modal open={false} title="Test Dialog">
        Modal Content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render and handle close button clicks', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open title="Test Dialog" onClose={handleClose}>
        Modal Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close dialog');
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key press by default', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open title="Test Dialog" onClose={handleClose}>
        Content
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
