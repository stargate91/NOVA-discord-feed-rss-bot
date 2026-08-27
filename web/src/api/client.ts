import { errorReporter } from '@/services/errorReporter';
import { apiCircuitBreaker } from './circuitBreaker';
import type { RequestOptions, ErrorHandlerCallback, ApiInterceptor, RequestContext } from './types';
import { ApiError } from './types';
import { buildAuthHeaders, MutationQueueManager } from './core';

const DEFAULT_RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

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
  private interceptors: ApiInterceptor[] = [];

  // In-memory security credentials (isolated from arbitrary localStorage access)
  private authToken: string | null = null;
  private adminSecret: string | null = null;
  private csrfToken: string | null = null;

  // Token refresh concurrency management
  private tokenRefreshHandler: TokenRefreshHandler | null = null;
  private isRefreshingToken: boolean = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  // Client-side concurrency control & burst rate limiting for mutating requests
  private mutationQueue: MutationQueueManager;

  public constructor(baseUrlOrOptions: string | ApiClientOptions = '') {
    const options: ApiClientOptions =
      typeof baseUrlOrOptions === 'string'
        ? { baseUrl: baseUrlOrOptions }
        : (baseUrlOrOptions ?? {});

    const envBaseUrl =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL)
        : '';

    const rawUrl = options.baseUrl !== undefined ? options.baseUrl : envBaseUrl;
    this.baseUrl = rawUrl ? rawUrl.replace(/\/+$/, '') : '';
    this.defaultTimeout = options.defaultTimeout ?? 10000;
    this.mutationQueue = new MutationQueueManager(options.maxConcurrentMutations ?? 6);
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

  /**
   * Registers a middleware interceptor for request, response, or error transformation.
   * Returns an unsubscribe function to remove the interceptor.
   */
  public use(interceptor: ApiInterceptor): () => void {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index !== -1) {
        this.interceptors.splice(index, 1);
      }
    };
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
    return buildAuthHeaders({
      authToken: this.authToken,
      adminSecret: this.adminSecret,
      csrfToken: this.csrfToken,
      method,
    });
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
    return this.mutationQueue.acquireSlot();
  }

  private releaseMutationSlot(): void {
    this.mutationQueue.releaseSlot();
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

    const wrapWithSignal = (promise: Promise<T>, sig?: AbortSignal): Promise<T> => {
      if (!sig) return promise;
      if (sig.aborted) {
        return Promise.reject(new ApiError('Request was cancelled', 408, null, url));
      }
      return new Promise<T>((resolve, reject) => {
        const onAbort = () => {
          reject(new ApiError('Request was cancelled', 408, null, url));
        };
        sig.addEventListener('abort', onAbort, { once: true });
        promise
          .then((res) => {
            sig.removeEventListener('abort', onAbort);
            resolve(res);
          })
          .catch((err) => {
            sig.removeEventListener('abort', onAbort);
            reject(err);
          });
      });
    };

    // Deduplication check for concurrent identical requests
    const dedupKey = dedup ? `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}` : null;
    if (dedupKey && this.inFlightRequests.has(dedupKey)) {
      return wrapWithSignal(this.inFlightRequests.get(dedupKey) as Promise<T>, customSignal);
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
          const mergedSignal = timeoutController.signal;

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

          let context: RequestContext<T> = {
            url,
            method,
            headers: finalHeaders,
            body,
            options,
          };

          // 1. Run Request Interceptors
          for (const interceptor of this.interceptors) {
            if (interceptor.onRequest) {
              const updated = await interceptor.onRequest(context as RequestContext);
              if (updated) {
                context = updated as RequestContext<T>;
              }
            }
          }

          let serializedBody: string | undefined;
          if (context.body !== undefined) {
            context.headers['Content-Type'] = 'application/json';
            serializedBody = JSON.stringify(context.body);
          }

          try {
            const response = await fetch(context.url, {
              method: context.method,
              headers: context.headers,
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
              let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
              if (typeof responseData === 'object' && responseData !== null) {
                const dataObj = responseData as Record<string, unknown>;
                if (typeof dataObj.detail === 'string') {
                  errorMessage = dataObj.detail;
                } else if (typeof dataObj.message === 'string') {
                  errorMessage = dataObj.message;
                } else if (typeof dataObj.error === 'string') {
                  errorMessage = dataObj.error;
                } else if (dataObj.detail && typeof dataObj.detail === 'object') {
                  errorMessage = JSON.stringify(dataObj.detail);
                }
              }

              const apiError = new ApiError(
                errorMessage,
                response.status,
                responseData,
                context.url
              );

              // Run Error Interceptors
              for (const interceptor of this.interceptors) {
                if (interceptor.onError) {
                  try {
                    await interceptor.onError(apiError, context);
                  } catch {
                    // Ignore interceptor errors
                  }
                }
              }

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

            // 2. Run Response Interceptors
            for (const interceptor of this.interceptors) {
              if (interceptor.onResponse) {
                const transformed = await interceptor.onResponse(responseData, response, context);
                if (transformed !== undefined) {
                  responseData = transformed;
                }
              }
            }

            // Response validation if provided
            if (validate && !validate(responseData)) {
              const validationError = new ApiError(
                'Response schema validation failed',
                response.status,
                responseData,
                context.url
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

            const networkError = new ApiError(
              fallbackMessage,
              isAbort ? 408 : 0,
              null,
              context.url
            );

            // Run Error Interceptors for network errors
            for (const interceptor of this.interceptors) {
              if (interceptor.onError) {
                try {
                  await interceptor.onError(networkError, context);
                } catch {
                  // Ignore interceptor errors
                }
              }
            }

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

    return wrapWithSignal(requestPromise, customSignal);
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
