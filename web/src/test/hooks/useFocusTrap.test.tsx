import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const TestModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} data-testid="trap-container" tabIndex={-1}>
      <button type="button" data-testid="btn-first">
        First
      </button>
      <input data-testid="input-middle" type="text" />
      <button type="button" data-testid="btn-last">
        Last
      </button>
    </div>
  );
};

describe('useFocusTrap Hook', () => {
  it('should focus the first focusable element when opened', () => {
    render(<TestModal isOpen />);
    expect(screen.getByTestId('btn-first')).toHaveFocus();
  });

  it('should wrap focus to first element when Tab is pressed on last element', async () => {
    const user = userEvent.setup();
    render(<TestModal isOpen />);

    const firstBtn = screen.getByTestId('btn-first');
    const lastBtn = screen.getByTestId('btn-last');

    lastBtn.focus();
    expect(lastBtn).toHaveFocus();

    await user.tab();
    expect(firstBtn).toHaveFocus();
  });

  it('should wrap focus to last element when Shift+Tab is pressed on first element', async () => {
    const user = userEvent.setup();
    render(<TestModal isOpen />);

    const firstBtn = screen.getByTestId('btn-first');
    const lastBtn = screen.getByTestId('btn-last');

    firstBtn.focus();
    expect(firstBtn).toHaveFocus();

    await user.tab({ shift: true });
    expect(lastBtn).toHaveFocus();
  });
});
