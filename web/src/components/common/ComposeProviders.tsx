import React from 'react';

export type ProviderComponent = React.ComponentType<{ children: React.ReactNode }>;

export interface ComposeProvidersProps {
  providers: ProviderComponent[];
  children: React.ReactNode;
}

/**
 * Composes multiple React Context Providers into a single flat hierarchy,
 * eliminating deep JSX pyramid-of-doom nesting.
 */
export const ComposeProviders: React.FC<ComposeProvidersProps> = ({ providers, children }) => {
  return (
    <>
      {providers.reduceRight(
        (acc, Provider) => (
          <Provider>{acc}</Provider>
        ),
        children
      )}
    </>
  );
};
