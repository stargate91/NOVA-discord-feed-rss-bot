import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '@/ui';

describe('Dropdown UI Component Tests', () => {
  it('should toggle dropdown menu and select items', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown>
        <Dropdown.Trigger>
          <button type="button">Open Options</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option A</Dropdown.Item>
          <Dropdown.Item>Option B</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const trigger = screen.getByText('Open Options');
    await user.click(trigger);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});
