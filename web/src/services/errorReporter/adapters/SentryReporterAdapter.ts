import type { ErrorReportPayload, ErrorReporterAdapter } from '../types';
import { parseStackTrace } from '../utils/parseStackTrace';

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
        payload.error instanceof Error ? payload.error : new Error(String(payload.error));

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
