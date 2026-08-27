import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulated runtime error');
  }
  return <div>Healthy Child Component</div>;
};

describe('ErrorBoundary Integration', () => {
  // Suppress expected console.error during boundary catches
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
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Child Component')).toBeInTheDocument();
  });

  it('should catch error and display fallback UI when child throws', () => {
    render(
      <ErrorBoundary name="Test Component">
        <ProblemChild shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Healthy Child Component')).not.toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});
