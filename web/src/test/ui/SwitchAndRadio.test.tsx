import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch, Radio, Checkbox } from '@/ui';

describe('Switch, Radio, and Checkbox Form UI Components', () => {
  it('should toggle Switch on click', async () => {
    const user = userEvent.setup();

    const TestSwitch: React.FC = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          checked={checked}
          onChange={setChecked}
          label="Enable Notifications"
        />
      );
    };

    render(<TestSwitch />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle Checkbox when clicked', async () => {
    const user = userEvent.setup();

    const TestCheckbox: React.FC = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label="Accept Terms"
        />
      );
    };

    render(<TestCheckbox />);
    const checkboxEl = screen.getByRole('checkbox');
    expect(checkboxEl).not.toBeChecked();

    await user.click(checkboxEl);
    expect(checkboxEl).toBeChecked();
  });

  it('should select Radio option in group', async () => {
    const user = userEvent.setup();

    const TestRadio: React.FC = () => {
      const [selected, setSelected] = useState('a');
      return (
        <Radio.Group name="tier" value={selected} onChange={setSelected}>
          <Radio value="a" label="Tier A" />
          <Radio value="b" label="Tier B" />
        </Radio.Group>
      );
    };

    render(<TestRadio />);
    const radioB = screen.getByLabelText('Tier B');
    await user.click(radioB);
    expect(radioB).toBeChecked();
  });
});
