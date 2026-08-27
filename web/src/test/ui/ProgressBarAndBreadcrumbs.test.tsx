import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar, Breadcrumbs } from '@/ui';

describe('ProgressBar and Breadcrumbs UI Tests', () => {
  it('should render ProgressBar with progress values', () => {
    render(<ProgressBar value={75} max={100} label="Storage Usage" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('Storage Usage')).toBeInTheDocument();
  });

  it('should render Breadcrumbs with items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Servers', href: '/servers' },
          { label: 'Overview' },
        ]}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});
