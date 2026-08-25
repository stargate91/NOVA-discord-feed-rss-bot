export type LogLevel = 'error' | 'warning' | 'info' | 'default';

/**
 * Parses a raw system log line and extracts its log severity level.
 */
export function getLogLevel(line: string): LogLevel {
  if (!line) return 'default';
  if (line.includes('[ERROR]')) return 'error';
  if (line.includes('[WARNING]')) return 'warning';
  if (line.includes('[INFO]')) return 'info';
  return 'default';
}
