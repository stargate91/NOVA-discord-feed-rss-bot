import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/ui';

const ControlledTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
        <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
      <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
    </Tabs>
  );
};

describe('Tabs Component', () => {
  it('should render active tab content and switch on click', async () => {
    const user = userEvent.setup();
    render(<ControlledTabs />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });
});
