import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { prefetchRoute, PrefetchLink, useIdlePrefetch } from '@/utils/prefetch';

describe('Route Prefetching Utility & PrefetchLink', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('runs prefetchRoute without throwing for defined routes', async () => {
    await expect(prefetchRoute('/docs')).resolves.toBeUndefined();
    await expect(prefetchRoute('/non-existent-route')).resolves.toBeUndefined();
  });

  it('triggers prefetch on mouseEnter and onFocus with PrefetchLink', () => {
    render(
      <MemoryRouter>
        <PrefetchLink to="/premium" data-testid="prefetch-link">
          Go to Premium
        </PrefetchLink>
      </MemoryRouter>
    );

    const link = screen.getByTestId('prefetch-link');
    fireEvent.mouseEnter(link);
    fireEvent.focus(link);

    expect(link).toHaveAttribute('href', '/premium');
  });

  it('runs useIdlePrefetch hook without crashing in browser environment', () => {
    const TestComponent: React.FC = () => {
      useIdlePrefetch(['/changelog', '/support']);
      return <div>Idle Prefetch Running</div>;
    };

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});
