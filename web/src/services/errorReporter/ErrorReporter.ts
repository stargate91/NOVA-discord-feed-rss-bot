import type {
  Breadcrumb,
  ErrorReportPayload,
  ErrorReporterAdapter,
  ErrorSeverity,
  UserContext,
} from './types';
import { createDefaultReporterAdapter } from './adapters';

export class ErrorReporter {
  private adapter: ErrorReporterAdapter = createDefaultReporterAdapter();
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs: number = 50;
  private user: UserContext | null = null;
  private isInitialized: boolean = false;

  public constructor() {
    this.initGlobalListeners();
  }

  /**
   * Automatically attaches global unhandled promise rejection and window error listeners.
   */
  public initGlobalListeners(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.captureException(
        event.reason || 'Unhandled Promise Rejection',
        { type: 'unhandledrejection' },
        'error'
      );
    });

    window.addEventListener('error', (event: ErrorEvent) => {
      this.captureException(
        event.error || event.message,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'window.onerror',
        },
        'error'
      );
    });
  }

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
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
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
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    try {
      this.adapter.sendReport(payload);
    } catch {
      // Avoid crash
    }
  }
}
