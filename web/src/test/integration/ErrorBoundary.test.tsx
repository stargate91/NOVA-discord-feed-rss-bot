import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { queryCache } from '@/api';

const FlakyChild: React.FC<{ shouldFail: boolean }> = ({ shouldFail }) => {
  if (shouldFail) {
    throw new Error('Simulated network error');
  }
  return <div>Healthy Child Component</div>;
};

const RecoveryContainer: React.FC = () => {
  const [hasError, setHasError] = useState(true);

  return (
    <ErrorBoundary name="Recovery Component" onReset={() => setHasError(false)}>
      <FlakyChild shouldFail={hasError} />
    </ErrorBoundary>
  );
};

describe('ErrorBoundary Integration', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children normally when there is no error', () => {
    render(
      <ErrorBoundary name="Test Component">
        <FlakyChild shouldFail={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Child Component')).toBeInTheDocument();
  });

  it('should catch error and display fallback UI when child throws', () => {
    render(
      <ErrorBoundary name="Test Component">
        <FlakyChild shouldFail />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Healthy Child Component')).not.toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('should clear query cache and invoke onReset when Try Again is clicked', async () => {
    const user = userEvent.setup();
    const cacheClearSpy = vi.spyOn(queryCache, 'clear');

    render(<RecoveryContainer />);

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
    await user.click(tryAgainButton);

    expect(cacheClearSpy).toHaveBeenCalled();
    expect(screen.getByText('Healthy Child Component')).toBeInTheDocument();

    cacheClearSpy.mockRestore();
  });
});
