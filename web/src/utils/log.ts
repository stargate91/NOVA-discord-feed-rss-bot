export type LogLevel = 'error' | 'warning' | 'info' | 'default';

export interface FormattedLogLine {
  text: string;
  level: LogLevel;
  modifier: string;
}

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

/**
 * Parses a raw log line into structured display metadata.
 */
export function parseLogLine(line: string): FormattedLogLine | null {
  if (!line || !line.trim()) return null;
  const level = getLogLevel(line);
  return {
    text: line,
    level,
    modifier: level === 'default' ? '' : level,
  };
}

/**
 * Resolves the CSS module class name for a given log modifier level.
 */
export function getLogModifierClass(modifier: string, styles: Record<string, string> = {}): string {
  if (!modifier) return '';
  return styles[`log-${modifier}`] || '';
}

