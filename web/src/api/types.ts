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
