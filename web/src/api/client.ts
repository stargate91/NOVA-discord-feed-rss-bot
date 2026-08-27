import { AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from '../auth/context';
import { errorReporter } from '../services/errorReporter';
import { apiCircuitBreaker } from './circuitBreaker';
import type { RequestOptions, ErrorHandlerCallback } from './types';
import { ApiError } from './types';

/**
 * Combines multiple AbortSignals so that any single abort triggers cancellation.
 */
const combineSignals = (signals: (AbortSignal | undefined)[]): AbortSignal => {
  const activeSignals = signals.filter((s): s is AbortSignal => Boolean(s));
  if (activeSignals.length === 0) {
    return new AbortController().signal;
  }
  if (activeSignals.length === 1) {
    return activeSignals[0];
  }

  // Modern browser AbortSignal.any support
  if (
    typeof AbortSignal !== 'undefined' &&
    'any' in AbortSignal &&
    typeof AbortSignal.any === 'function'
  ) {
    return AbortSignal.any(activeSignals);
  }

  const controller = new AbortController();
  for (const signal of activeSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
};

const DEFAULT_RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;
  private errorListeners: Set<ErrorHandlerCallback> = new Set();
  private inFlightRequests: Map<string, Promise<unknown>> = new Map();

  public constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  public onError(listener: ErrorHandlerCallback): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  private notifyError(error: ApiError): void {
    errorReporter.captureException(error, {
      status: error.status,
      url: error.url,
      data: error.data,
    });

    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch {
        // Ignore listener exceptions
      }
    });
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const adminSecret = localStorage.getItem(ADMIN_SECRET_KEY);
        if (adminSecret) {
          headers['X-Webhook-Secret'] = adminSecret;
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    return headers;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async request<T>(
    endpoint: string,
    method: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      headers = {},
      timeout = this.defaultTimeout,
      body,
      signal: customSignal,
      dedup = method === 'GET',
      maxRetries = 0,
      retryDelayMs = 500,
      retryOnStatus = DEFAULT_RETRYABLE_STATUSES,
      validate,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // Circuit Breaker check: fail-fast if backend is repeatedly failing
    if (!apiCircuitBreaker.isAvailable()) {
      const circuitError = new ApiError(
        'Circuit breaker is OPEN: Backend service is temporarily unavailable due to repeated failures',
        503,
        null,
        url
      );
      this.notifyError(circuitError);
      throw circuitError;
    }

    // Deduplication check for concurrent identical requests
    const dedupKey = dedup ? `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}` : null;
    if (dedupKey && this.inFlightRequests.has(dedupKey)) {
      return this.inFlightRequests.get(dedupKey) as Promise<T>;
    }

    const executeRequest = async (): Promise<T> => {
      let attempt = 0;

      while (attempt <= maxRetries) {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
        const mergedSignal = combineSignals([customSignal, timeoutController.signal]);

        const finalHeaders: Record<string, string> = {
          Accept: 'application/json',
          ...this.getAuthHeaders(),
          ...headers,
        };

        let serializedBody: string | undefined;
        if (body !== undefined) {
          finalHeaders['Content-Type'] = 'application/json';
          serializedBody = JSON.stringify(body);
        }

        try {
          const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: serializedBody,
            signal: mergedSignal,
          });

          clearTimeout(timeoutId);

          // Parse JSON if available
          let responseData: unknown = null;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
          } else {
            const text = await response.text();
            responseData = text ? { message: text } : null;
          }

          if (!response.ok) {
            const errorMessage =
              typeof responseData === 'object' && responseData && 'message' in responseData
                ? String((responseData as { message: unknown }).message)
                : `HTTP Error ${response.status}: ${response.statusText}`;

            const apiError = new ApiError(errorMessage, response.status, responseData, url);

            // Record server failure on circuit breaker for 5xx
            if (response.status >= 500) {
              apiCircuitBreaker.recordFailure();
            }

            // Retry on designated status codes
            if (
              attempt < maxRetries &&
              retryOnStatus.includes(response.status) &&
              !customSignal?.aborted
            ) {
              attempt += 1;
              const backoff = retryDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
              await this.sleep(backoff);
              continue;
            }

            this.notifyError(apiError);
            throw apiError;
          }

          // Response validation if provided
          if (validate && !validate(responseData)) {
            const validationError = new ApiError(
              'Response schema validation failed',
              response.status,
              responseData,
              url
            );
            this.notifyError(validationError);
            throw validationError;
          }

          // Record success on circuit breaker
          apiCircuitBreaker.recordSuccess();

          return responseData as T;
        } catch (err: unknown) {
          clearTimeout(timeoutId);

          if (err instanceof ApiError) {
            throw err;
          }

          const isAbort = err instanceof DOMException && err.name === 'AbortError';
          const isUserAbort = customSignal?.aborted;
          const fallbackMessage = isAbort
            ? isUserAbort
              ? 'Request was cancelled'
              : `Request timeout after ${timeout}ms`
            : (err as Error).message || 'Network communication failure';

          const networkError = new ApiError(fallbackMessage, isAbort ? 408 : 0, null, url);

          // Record failure on circuit breaker for network failures
          if (!isUserAbort) {
            apiCircuitBreaker.recordFailure();
          }

          // Retry on network errors or timeouts (unless explicitly aborted by caller)
          if (attempt < maxRetries && !isUserAbort) {
            attempt += 1;
            const backoff = retryDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
            await this.sleep(backoff);
            continue;
          }

          this.notifyError(networkError);
          throw networkError;
        }
      }

      throw new ApiError('Request failed after max retries', 0, null, url);
    };

    const requestPromise = executeRequest().finally(() => {
      if (dedupKey) {
        this.inFlightRequests.delete(dedupKey);
      }
    });

    if (dedupKey) {
      this.inFlightRequests.set(dedupKey, requestPromise);
    }

    return requestPromise;
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  public async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  public async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  public async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

export const apiClient = new ApiClient();
