import type { ErrorReportPayload, ErrorReporterAdapter, HttpReporterConfig } from '../types';

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
