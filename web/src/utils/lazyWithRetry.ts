import type { ComponentType } from 'react';
import { lazy } from 'react';

/**
 * Wraps dynamic React.lazy imports with exponential/interval retry logic to gracefully handle
 * transient chunk loading errors due to network drops or asset deployments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 2,
  intervalMs: number = 1000
): React.LazyExoticComponent<T> => {
  return lazy(
    () =>
      new Promise<{ default: T }>((resolve, reject) => {
        const attemptImport = (attemptsLeft: number) => {
          componentImport()
            .then(resolve)
            .catch((error: unknown) => {
              if (attemptsLeft === 0) {
                reject(error);
                return;
              }
              setTimeout(() => {
                attemptImport(attemptsLeft - 1);
              }, intervalMs);
            });
        };

        attemptImport(retries);
      })
  );
};
