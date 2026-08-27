import { AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from '../auth/context';
import type { RequestOptions, ErrorHandlerCallback } from './types';
import { ApiError } from './types';

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;
  private errorListeners: Set<ErrorHandlerCallback> = new Set();

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

  public async request<T>(endpoint: string, method: string, options: RequestOptions = {}): Promise<T> {
    const { headers = {}, timeout = this.defaultTimeout, body, signal: customSignal } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const mergedSignal = customSignal || controller.signal;
    const url = `${this.baseUrl}${endpoint}`;

    const finalHeaders: Record<string, string> = {
      'Accept': 'application/json',
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
        this.notifyError(apiError);
        throw apiError;
      }

      return responseData as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const fallbackMessage = isAbort ? `Request timeout after ${timeout}ms` : (err as Error).message || 'Network communication failure';

      const networkError = new ApiError(fallbackMessage, isAbort ? 408 : 0, null, url);
      this.notifyError(networkError);
      throw networkError;
    }
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
