import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container, Grid, Stack, Inline, Breadcrumbs, Pagination, Accordion } from '@/ui';

describe('Layout Primitives & Navigation UI Tests', () => {
  it('should render Container, Grid, Stack, and Inline layout components', () => {
    const { container } = render(
      <Container maxWidth="xl">
        <Stack gap="md">
          <Inline gap="sm">
            <span>Item 1</span>
            <span>Item 2</span>
          </Inline>
          <Grid columns={3} gap="lg">
            <div>Column 1</div>
            <div>Column 2</div>
            <div>Column 3</div>
          </Grid>
        </Stack>
      </Container>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render Breadcrumbs navigation with items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Servers', href: '/servers' },
          { label: 'Nova Gaming' },
        ]}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('Nova Gaming')).toBeInTheDocument();
  });

  it('should render Pagination controls and respond to page changes', async () => {
    const user = userEvent.setup();
    const PaginationWrapper = () => {
      const [page, setPage] = React.useState(1);
      return <Pagination page={page} totalPages={5} onPageChange={setPage} />;
    };

    render(<PaginationWrapper />);
    const page3Btn = screen.getByRole('button', { name: '3' });
    expect(page3Btn).toBeInTheDocument();

    await user.click(page3Btn);
    expect(page3Btn).toHaveAttribute('aria-current', 'page');
  });

  it('should render Accordion and toggle panel content visibility on click', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>What is sub-second latency?</Accordion.Trigger>
          <Accordion.Content>
            Nova feeds monitors live platforms every 500ms for instantaneous delivery.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByText('What is sub-second latency?');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(
      screen.getByText('Nova feeds monitors live platforms every 500ms for instantaneous delivery.')
    ).toBeInTheDocument();
  });
});
