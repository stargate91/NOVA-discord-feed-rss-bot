import { AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from '@/auth/context';
import { errorReporter } from '@/services/errorReporter';
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

/**
 * Reads a cookie value by name.
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export type TokenRefreshHandler = () => Promise<string | null>;

export interface ApiClientOptions {
  baseUrl?: string;
  defaultTimeout?: number;
  maxConcurrentMutations?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;
  private errorListeners: Set<ErrorHandlerCallback> = new Set();
  private inFlightRequests: Map<string, Promise<unknown>> = new Map();

  // In-memory security credentials (isolated from arbitrary localStorage access)
  private authToken: string | null = null;
  private adminSecret: string | null = null;
  private csrfToken: string | null = null;

  // Token refresh concurrency management
  private tokenRefreshHandler: TokenRefreshHandler | null = null;
  private isRefreshingToken: boolean = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  // Client-side concurrency control & burst rate limiting for mutating requests
  private activeMutations: number = 0;
  private maxConcurrentMutations: number = 6;
  private mutationQueue: (() => void)[] = [];

  public constructor(baseUrlOrOptions: string | ApiClientOptions = '') {
    const options: ApiClientOptions =
      typeof baseUrlOrOptions === 'string'
        ? { baseUrl: baseUrlOrOptions }
        : baseUrlOrOptions ?? {};

    const envBaseUrl =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL)
        : '';

    const rawUrl = options.baseUrl !== undefined ? options.baseUrl : envBaseUrl;
    this.baseUrl = rawUrl ? rawUrl.replace(/\/+$/, '') : '';
    this.defaultTimeout = options.defaultTimeout ?? 10000;
    this.maxConcurrentMutations = options.maxConcurrentMutations ?? 6;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url ? url.replace(/\/+$/, '') : '';
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public setAdminSecret(secret: string | null): void {
    this.adminSecret = secret;
  }

  public setCsrfToken(csrfToken: string | null): void {
    this.csrfToken = csrfToken;
  }

  public setTokenRefreshHandler(handler: TokenRefreshHandler | null): void {
    this.tokenRefreshHandler = handler;
  }

  public clearSession(): void {
    this.authToken = null;
    this.adminSecret = null;
    this.csrfToken = null;
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

  private getAuthHeaders(method: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // 1. Authorization Header (Bearer token)
    const effectiveToken =
      this.authToken ||
      (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);

    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    // 2. Admin Webhook Secret Header (supports sessionStorage / in-memory override)
    const effectiveSecret =
      this.adminSecret ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem(ADMIN_SECRET_KEY) || localStorage.getItem(ADMIN_SECRET_KEY)
        : null);

    if (effectiveSecret) {
      headers['X-Webhook-Secret'] = effectiveSecret;
    }

    // 3. CSRF Protection Header for mutating HTTP methods
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(method.toUpperCase())) {
      const csrf = this.csrfToken || getCookie('nova_csrf') || getCookie('csrftoken');
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
      }
    }

    return headers;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (!this.tokenRefreshHandler) return null;

    if (this.isRefreshingToken) {
      return new Promise<string | null>((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshingToken = true;

    try {
      const newToken = await this.tokenRefreshHandler();
      this.authToken = newToken;
      this.refreshSubscribers.forEach((callback) => callback(newToken));
      this.refreshSubscribers = [];
      return newToken;
    } catch {
      this.refreshSubscribers.forEach((callback) => callback(null));
      this.refreshSubscribers = [];
      return null;
    } finally {
      this.isRefreshingToken = false;
    }
  }

  private async acquireMutationSlot(): Promise<void> {
    if (this.activeMutations < this.maxConcurrentMutations) {
      this.activeMutations += 1;
      return;
    }

    return new Promise<void>((resolve) => {
      this.mutationQueue.push(() => {
        this.activeMutations += 1;
        resolve();
      });
    });
  }

  private releaseMutationSlot(): void {
    this.activeMutations = Math.max(0, this.activeMutations - 1);
    const next = this.mutationQueue.shift();
    if (next) {
      next();
    }
  }

  public async request<T>(
    endpoint: string,
    method: string,
    options: RequestOptions<T> = {}
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
      token: overrideToken,
      adminSecret: overrideAdminSecret,
    } = options;

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = this.baseUrl ? `${this.baseUrl}${cleanEndpoint}` : cleanEndpoint;

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

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

    const executeRequest = async (): Promise<T> => {
      if (isMutation) {
        await this.acquireMutationSlot();
      }

      let attempt = 0;
      let hasRefreshedAuth = false;

      try {
        while (attempt <= maxRetries) {
          const timeoutController = new AbortController();
          const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
          const mergedSignal = combineSignals([customSignal, timeoutController.signal]);

          const authHeaders = this.getAuthHeaders(method);
          if (overrideToken) {
            authHeaders['Authorization'] = `Bearer ${overrideToken}`;
          }
          if (overrideAdminSecret) {
            authHeaders['X-Webhook-Secret'] = overrideAdminSecret;
          }

          const finalHeaders: Record<string, string> = {
            Accept: 'application/json',
            ...authHeaders,
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

            // Handle 401 Unauthorized with token refresh if configured
            if (response.status === 401 && !hasRefreshedAuth && this.tokenRefreshHandler) {
              hasRefreshedAuth = true;
              const refreshedToken = await this.handleTokenRefresh();
              if (refreshedToken) {
                continue; // Retry with refreshed token
              }
            }

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
      } finally {
        if (isMutation) {
          this.releaseMutationSlot();
        }
      }
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

  public async get<T>(endpoint: string, options?: RequestOptions<T>): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  public async post<T>(endpoint: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  public async put<T>(endpoint: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  public async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions<T>): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }

  public async delete<T>(endpoint: string, options?: RequestOptions<T>): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

export const apiClient = new ApiClient();
