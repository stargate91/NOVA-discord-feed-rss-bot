export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

export type ResponseValidator<T> = (data: unknown) => data is T;

export interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  retryOnStatus?: number[];
}

export interface RequestOptions<T = unknown> extends RetryOptions {
  headers?: Record<string, string>;
  timeout?: number;
  token?: string;
  adminSecret?: string;
  signal?: AbortSignal;
  body?: unknown;
  dedup?: boolean;
  validate?: ResponseValidator<T>;
}

export class ApiError extends Error {
  public status: number;
  public data: unknown;
  public url: string;

  public constructor(message: string, status: number, data?: unknown, url: string = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

export type ErrorHandlerCallback = (error: ApiError) => void;

// ------------------------------------------------------------------------------
// Middleware & Interceptor Types (Enterprise Request Pipeline)
// ------------------------------------------------------------------------------

export interface RequestContext<T = unknown> {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  options: RequestOptions<T>;
}

export type RequestInterceptor = (
  context: RequestContext
) => Promise<RequestContext | void> | RequestContext | void;

export type ResponseInterceptor = (
  data: unknown,
  response: Response,
  context: RequestContext
) => Promise<unknown | void> | unknown | void;

export type ErrorInterceptor = (
  error: ApiError,
  context: RequestContext
) => Promise<unknown | void> | unknown | void;

export interface ApiInterceptor {
  onRequest?: RequestInterceptor;
  onResponse?: ResponseInterceptor;
  onError?: ErrorInterceptor;
}
