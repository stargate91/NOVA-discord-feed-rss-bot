import React, { createContext, useContext } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComposeProviders } from '@/components/common/ComposeProviders';

const TestContextA = createContext<string>('default-a');
const TestContextB = createContext<string>('default-b');

const ProviderA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TestContextA.Provider value="value-a">{children}</TestContextA.Provider>
);

const ProviderB: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TestContextB.Provider value="value-b">{children}</TestContextB.Provider>
);

const Consumer: React.FC = () => {
  const a = useContext(TestContextA);
  const b = useContext(TestContextB);
  return (
    <div>
      <span data-testid="val-a">{a}</span>
      <span data-testid="val-b">{b}</span>
    </div>
  );
};

describe('ComposeProviders Utility', () => {
  it('correctly composes multiple providers in order without JSX nesting pyramid', () => {
    render(
      <ComposeProviders providers={[ProviderA, ProviderB]}>
        <Consumer />
      </ComposeProviders>
    );

    expect(screen.getByTestId('val-a')).toHaveTextContent('value-a');
    expect(screen.getByTestId('val-b')).toHaveTextContent('value-b');
  });

  it('renders children directly if providers array is empty', () => {
    render(
      <ComposeProviders providers={[]}>
        <div data-testid="child">Direct Child</div>
      </ComposeProviders>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Direct Child');
  });
});
