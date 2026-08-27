import type { ErrorReporterAdapter } from '../types';
import { ConsoleReporterAdapter } from './ConsoleReporterAdapter';
import { HttpWebhookReporterAdapter } from './HttpWebhookReporterAdapter';
import { SentryReporterAdapter } from './SentryReporterAdapter';

export * from './ConsoleReporterAdapter';
export * from './HttpWebhookReporterAdapter';
export * from './SentryReporterAdapter';

export const createDefaultReporterAdapter = (): ErrorReporterAdapter => {
  const sentryDsn = import.meta.env?.VITE_SENTRY_DSN;
  if (sentryDsn) {
    return new SentryReporterAdapter(sentryDsn);
  }

  const ingestEndpoint = import.meta.env?.VITE_ERROR_REPORTING_ENDPOINT;
  if (ingestEndpoint) {
    return new HttpWebhookReporterAdapter({ endpoint: ingestEndpoint });
  }

  return new ConsoleReporterAdapter();
};
