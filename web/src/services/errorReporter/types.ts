export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface Breadcrumb {
  category: string;
  message: string;
  level?: ErrorSeverity;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface UserContext {
  id: string;
  username?: string;
  guildId?: string;
}

export interface ErrorReportPayload {
  error: Error | string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  user?: UserContext | null;
  timestamp: number;
  url: string;
  userAgent?: string;
}

export interface ErrorReporterAdapter {
  sendReport(payload: ErrorReportPayload): void | Promise<void>;
}

export interface HttpReporterConfig {
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
}
