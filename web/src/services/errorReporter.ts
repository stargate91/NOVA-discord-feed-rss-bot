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

export class ConsoleReporterAdapter implements ErrorReporterAdapter {
  public sendReport(payload: ErrorReportPayload): void {
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

export interface HttpReporterConfig {
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

/**
 * Production HTTP ingest telemetry adapter (supports custom backend / Datadog / Grafana Faro).
 */
export class HttpWebhookReporterAdapter implements ErrorReporterAdapter {
  private config: HttpReporterConfig;

  public constructor(config: HttpReporterConfig) {
    this.config = config;
  }

  public async sendReport(payload: ErrorReportPayload): Promise<void> {
    if (typeof window === 'undefined') return;

    const body = JSON.stringify({
      error:
        payload.error instanceof Error
          ? {
              name: payload.error.name,
              message: payload.error.message,
              stack: payload.error.stack,
            }
          : { message: String(payload.error) },
      severity: payload.severity,
      context: payload.context,
      breadcrumbs: payload.breadcrumbs,
      user: payload.user,
      timestamp: payload.timestamp,
      url: payload.url,
      userAgent: navigator.userAgent,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      if (
        navigator.sendBeacon &&
        body.length < 64000 &&
        !this.config.apiKey &&
        !this.config.headers
      ) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(this.config.endpoint, blob);
        return;
      }

      await fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body,
        keepalive: true,
      });
    } catch {
      // Fail silently to prevent cascading failures
    }
  }
}

/**
 * Parses raw error stack strings into structured Sentry-compatible stack frames.
 */
function parseStackTrace(stack?: string) {
  if (!stack) return undefined;
  const lines = stack.split('\n').slice(1);
  const frames = lines
    .map((line) => {
      const match = line.match(/^\s*at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)|([^)]+))\)?/);
      if (!match) return null;
      return {
        function: match[1] || '<anonymous>',
        filename: match[2] || match[5] || 'unknown',
        lineno: match[3] ? parseInt(match[3], 10) : undefined,
        colno: match[4] ? parseInt(match[4], 10) : undefined,
        in_app: !(match[2] || '').includes('node_modules'),
      };
    })
    .filter(Boolean)
    .reverse();

  return frames.length > 0 ? { frames } : undefined;
}

/**
 * Enhanced Production Sentry SDK Adapter with full stack trace framing & envelope payload.
 */
export class SentryReporterAdapter implements ErrorReporterAdapter {
  private dsn: string;

  public constructor(dsn: string) {
    this.dsn = dsn;
  }

  public async sendReport(payload: ErrorReportPayload): Promise<void> {
    if (typeof window === 'undefined' || !this.dsn) return;

    try {
      const errorObj =
        payload.error instanceof Error
          ? payload.error
          : new Error(String(payload.error));

      const frames = parseStackTrace(errorObj.stack);

      const sentryPayload = {
        exception: {
          values: [
            {
              type: errorObj.name || 'Error',
              value: errorObj.message,
              stacktrace: frames || { frames: [{ filename: payload.url, in_app: true }] },
            },
          ],
        },
        level:
          payload.severity === 'fatal'
            ? 'fatal'
            : payload.severity === 'warning'
              ? 'warning'
              : 'error',
        timestamp: payload.timestamp / 1000,
        platform: 'javascript',
        sdk: {
          name: 'nova.web.sentry',
          version: '1.0.0',
        },
        user: payload.user ? { id: payload.user.id, username: payload.user.username } : undefined,
        extra: {
          ...payload.context,
          url: payload.url,
        },
        breadcrumbs: payload.breadcrumbs.map((b) => ({
          category: b.category,
          message: b.message,
          level: b.level || 'info',
          data: b.data,
          timestamp: b.timestamp ? b.timestamp / 1000 : Date.now() / 1000,
        })),
      };

      const match = this.dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/);
      if (match) {
        const [, publicKey, host, projectId] = match;
        const sentryUrl = `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`;

        await fetch(sentryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sentryPayload),
          keepalive: true,
        });
      }
    } catch {
      // Fail silently
    }
  }
}

export const createDefaultReporterAdapter = (): ErrorReporterAdapter => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (sentryDsn) {
    return new SentryReporterAdapter(sentryDsn);
  }

  const ingestEndpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;
  if (ingestEndpoint) {
    return new HttpWebhookReporterAdapter({ endpoint: ingestEndpoint });
  }

  return new ConsoleReporterAdapter();
};

class ErrorReporter {
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

export const errorReporter = new ErrorReporter();
