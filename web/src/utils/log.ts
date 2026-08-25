export type LogLevel = 'error' | 'warning' | 'info' | 'debug' | 'default';

export interface StructuredLogEntry {
  raw: string;
  timestamp?: string;
  level: LogLevel;
  module?: string;
  message: string;
  modifier: string;
}

export type FormattedLogLine = StructuredLogEntry;

/**
 * Parses a raw system log line and extracts its log severity level.
 */
export function getLogLevel(line: string): LogLevel {
  if (!line) return 'default';
  if (line.includes('[ERROR]') || line.includes(' - ERROR - ')) return 'error';
  if (line.includes('[WARNING]') || line.includes('[WARN]') || line.includes(' - WARNING - ')) return 'warning';
  if (line.includes('[INFO]') || line.includes(' - INFO - ')) return 'info';
  if (line.includes('[DEBUG]') || line.includes(' - DEBUG - ')) return 'debug';
  return 'default';
}

/**
 * Normalizes a log line (either already a StructuredLogEntry or a raw string).
 */
export function normalizeLogLine(log: string | StructuredLogEntry): StructuredLogEntry | null {
  if (!log) return null;
  if (typeof log === 'object' && log !== null && 'message' in log) {
    return log;
  }
  const str = String(log);
  if (!str.trim()) return null;
  const level = getLogLevel(str);
  return {
    raw: str,
    message: str,
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

export interface LogLevelMeta {
  color: string;
  badgeClass: string;
  prefix: string;
}

/**
 * Returns UI metadata for a log level (color, badge class name, and 3-letter prefix).
 */
export function getLogLevelMeta(level: LogLevel): LogLevelMeta {
  switch (level) {
    case 'error':
      return { color: '#ef4444', badgeClass: 'badge-error', prefix: 'ERR' };
    case 'warning':
      return { color: '#f59e0b', badgeClass: 'badge-warning', prefix: 'WRN' };
    case 'info':
      return { color: '#3b82f6', badgeClass: 'badge-info', prefix: 'INF' };
    case 'debug':
      return { color: '#10b981', badgeClass: 'badge-debug', prefix: 'DBG' };
    default:
      return { color: '#94a3b8', badgeClass: 'badge-default', prefix: 'LOG' };
  }
}



