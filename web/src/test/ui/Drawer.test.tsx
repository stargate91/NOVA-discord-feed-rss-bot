import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '../../ui';

describe('Drawer Component', () => {
  it('should not render when open is false', () => {
    render(
      <Drawer open={false} onClose={vi.fn()} title="Drawer Title">
        Drawer Content
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render content and trigger onClose when close button clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer open onClose={handleClose} title="Navigation Menu">
        Sidebar links
      </Drawer>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Navigation Menu')).toBeInTheDocument();
    expect(screen.getByText('Sidebar links')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close drawer');
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
