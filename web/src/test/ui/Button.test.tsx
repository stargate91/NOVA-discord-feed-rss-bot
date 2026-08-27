import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/ui';

describe('Button Component', () => {
  it('should render children and respond to clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>
    );

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled or loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Button variant="primary" disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button variant="primary" loading onClick={handleClick}>
        Loading Button
      </Button>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
