import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from './types';
import { queryCache } from './queryCache';

export interface UseApiQueryOptions {
  key?: string;
  ttlMs?: number;
  revalidateOnMount?: boolean;
  revalidateOnFocus?: boolean;
  dedupingIntervalMs?: number;
  enabled?: boolean;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isValidating: boolean;
  refetch: () => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T), shouldRevalidate?: boolean) => void;
}

export const useApiQuery = <T>(
  queryFn: () => Promise<T>,
  deps: readonly unknown[] = [],
  options: UseApiQueryOptions = {}
): UseApiQueryResult<T> => {
  const {
    key,
    ttlMs = 30000,
    revalidateOnMount = true,
    revalidateOnFocus = false,
    dedupingIntervalMs = 2000,
    enabled = true,
  } = options;

  // Read initial data from cache if key provided
  const cachedData = key ? queryCache.get<T>(key) : undefined;

  const [data, setData] = useState<T | null>(cachedData ?? null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled && cachedData === undefined);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const lastFetchTime = useRef<number>(0);
  const isMounted = useRef<boolean>(true);
  const dataRef = useRef<T | null>(data);
  dataRef.current = data;

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  // Subscribe to external cache updates for the same key
  useEffect(() => {
    if (!key) return;
    return queryCache.subscribe<T>(key, (updatedData) => {
      if (isMounted.current) {
        setData(updatedData);
      }
    });
  }, [key]);

  const execute = useCallback(
    async (isManualRefetch: boolean = false) => {
      if (!enabled) return;

      // Deduplication check
      const now = Date.now();
      if (!isManualRefetch && now - lastFetchTime.current < dedupingIntervalMs) {
        return;
      }
      lastFetchTime.current = now;

      // Check current fresh value using dataRef and cache rather than stale closure
      const currentVal = dataRef.current;
      const currentCache = key ? queryCache.get<T>(key) : undefined;

      if (currentVal === null && currentCache === undefined) {
        setIsLoading(true);
      }
      setIsValidating(true);
      setError(null);

      try {
        const result = await queryFnRef.current();
        if (isMounted.current) {
          setData(result);
          if (key) {
            queryCache.set(key, result, ttlMs);
          }
        }
      } catch (err: unknown) {
        if (isMounted.current) {
          const apiError =
            err instanceof ApiError
              ? err
              : new ApiError(
                  err instanceof Error ? err.message : 'Unknown query execution error',
                  0,
                  err
                );
          setError(apiError);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsValidating(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, ttlMs, dedupingIntervalMs, enabled, ...deps]
  );

  // Initial fetch / SWR revalidation
  useEffect(() => {
    isMounted.current = true;

    if (enabled && revalidateOnMount) {
      if (!key || queryCache.isStale(key)) {
        execute();
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [execute, key, revalidateOnMount, enabled]);

  // Window Focus Revalidation
  useEffect(() => {
    if (!enabled || !revalidateOnFocus) return;

    const handleFocus = () => {
      if (key && queryCache.isStale(key)) {
        execute();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [execute, key, revalidateOnFocus, enabled]);

  // Optimistic Mutation & Cache Sync
  const mutate = useCallback(
    (newData: T | ((prev: T | null) => T), shouldRevalidate: boolean = false) => {
      setData((current) => {
        const resolvedData =
          typeof newData === 'function' ? (newData as (prev: T | null) => T)(current) : newData;

        if (key) {
          queryCache.set(key, resolvedData, ttlMs);
        }

        if (shouldRevalidate) {
          setTimeout(() => execute(true), 0);
        }

        return resolvedData;
      });
    },
    [key, ttlMs, execute]
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refetch: () => execute(true),
    mutate,
  };
};
