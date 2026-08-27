import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@/ui';

describe('Accordion UI Component Tests', () => {
  it('should toggle accordion items when clicked', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>Content 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger1 = screen.getByText('Section 1');
    expect(trigger1).toBeInTheDocument();

    await user.click(trigger1);
    expect(screen.getByText('Content 1')).toBeVisible();
  });
});
