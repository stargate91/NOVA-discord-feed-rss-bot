import type { ErrorReportPayload, ErrorReporterAdapter } from '../types';

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
