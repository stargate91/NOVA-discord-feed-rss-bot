import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiError } from './types';
import { queryCache } from './queryCache';

export interface UseApiMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: ApiError, variables: TVariables) => void | Promise<void>;
  onSettled?: (
    data: TData | null,
    error: ApiError | null,
    variables: TVariables
  ) => void | Promise<void>;
  invalidateKeys?: (string | RegExp)[];
}

export interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: ApiError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export const useApiMutation = <TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {}
): UseApiMutationResult<TData, TVariables> => {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const isMounted = useRef<boolean>(true);
  const mutationFnRef = useRef(mutationFn);
  mutationFnRef.current = mutationFn;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setError(null);

    try {
      const result = await mutationFnRef.current(variables);

      if (isMounted.current) {
        setData(result);
        setIsSuccess(true);
        setIsLoading(false);
      }

      // Invalidate associated query keys
      if (optionsRef.current.invalidateKeys && optionsRef.current.invalidateKeys.length > 0) {
        optionsRef.current.invalidateKeys.forEach((keyOrPattern) => {
          queryCache.invalidate(keyOrPattern);
        });
      }

      if (optionsRef.current.onSuccess) {
        await optionsRef.current.onSuccess(result, variables);
      }
      if (optionsRef.current.onSettled) {
        await optionsRef.current.onSettled(result, null, variables);
      }

      return result;
    } catch (err: unknown) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(err instanceof Error ? err.message : 'Mutation execution failed', 0, err);

      if (isMounted.current) {
        setError(apiError);
        setIsError(true);
        setIsLoading(false);
      }

      if (optionsRef.current.onError) {
        await optionsRef.current.onError(apiError, variables);
      }
      if (optionsRef.current.onSettled) {
        await optionsRef.current.onSettled(null, apiError, variables);
      }

      throw apiError;
    }
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        return await mutateAsync(variables);
      } catch {
        return null;
      }
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
};
