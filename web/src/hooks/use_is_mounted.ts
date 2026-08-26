import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns true when the component has mounted on the client.
 * Prevents SSR hydration mismatch without triggering unnecessary extra renders.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/**
 * Alias for useIsMounted to check client execution environment.
 */
export const useIsClient = useIsMounted;

export default useIsMounted;
