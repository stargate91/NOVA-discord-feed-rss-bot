import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '@/ui';

describe('SegmentedControl UI Component Tests', () => {
  it('should switch active segment on click', async () => {
    const user = userEvent.setup();

    const TestComponent: React.FC = () => {
      const [value, setValue] = useState('daily');
      return (
        <SegmentedControl
          value={value}
          onChange={setValue}
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
      );
    };

    render(<TestComponent />);

    const weeklyOption = screen.getByText('Weekly');
    await user.click(weeklyOption);

    expect(screen.getByRole('tab', { name: 'Weekly' })).toHaveAttribute('aria-selected', 'true');
  });
});
