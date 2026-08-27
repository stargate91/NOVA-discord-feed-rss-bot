import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '@/ui';

describe('Tooltip UI Component Tests', () => {
  it('should display tooltip content on hover or focus', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Helper informative text" delay={0}>
        <button type="button">Hover Me</button>
      </Tooltip>
    );

    const btn = screen.getByText('Hover Me');
    expect(btn).toBeInTheDocument();

    await user.hover(btn);
    expect(screen.getByText('Helper informative text')).toBeInTheDocument();
  });
});
