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
}

export interface ErrorReporterAdapter {
  sendReport(payload: ErrorReportPayload): void | Promise<void>;
}

class ConsoleReporterAdapter implements ErrorReporterAdapter {
  public sendReport(payload: ErrorReportPayload): void {
    // Only log in non-test browser console or when explicitly enabled
    if (typeof window !== 'undefined') {
      const errorDetails =
        payload.error instanceof Error
          ? payload.error.stack || payload.error.message
          : payload.error;
      console.warn(
        `[ErrorReporter:${payload.severity.toUpperCase()}] ${payload.url}`,
        errorDetails,
        {
          context: payload.context,
          breadcrumbs: payload.breadcrumbs,
          user: payload.user,
        }
      );
    }
  }
}

class ErrorReporter {
  private adapter: ErrorReporterAdapter = new ConsoleReporterAdapter();
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs: number = 50;
  private user: UserContext | null = null;

  public setAdapter(adapter: ErrorReporterAdapter): void {
    this.adapter = adapter;
  }

  public setUser(user: UserContext | null): void {
    this.user = user;
  }

  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now(),
    });
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  public captureException(
    error: Error | unknown,
    context?: Record<string, unknown>,
    severity: ErrorSeverity = 'error'
  ): void {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : JSON.stringify(error));

    const payload: ErrorReportPayload = {
      error: normalizedError,
      severity,
      context,
      breadcrumbs: [...this.breadcrumbs],
      user: this.user,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      this.adapter.sendReport(payload);
    } catch {
      // Avoid crash inside error reporting
    }
  }

  public captureMessage(
    message: string,
    severity: ErrorSeverity = 'info',
    context?: Record<string, unknown>
  ): void {
    const payload: ErrorReportPayload = {
      error: message,
      severity,
      context,
      breadcrumbs: [...this.breadcrumbs],
      user: this.user,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      this.adapter.sendReport(payload);
    } catch {
      // Avoid crash
    }
  }
}

export const errorReporter = new ErrorReporter();
