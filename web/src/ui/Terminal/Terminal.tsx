import type { ReactNode } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './Terminal.module.css';

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

export interface StructuredLog {
  id?: string;
  timestamp?: string;
  level?: LogLevel;
  source?: string;
  message: string;
}

export interface TerminalProps {
  logs?: Array<string | StructuredLog>;
  title?: string;
  variant?: 'window' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'full';
  copyable?: boolean;
  autoScroll?: boolean;
  emptyMessage?: string;
  actions?: ReactNode;
  className?: string;
  id?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  logs = [],
  title = 'console.log',
  variant = 'window',
  size = 'md',
  copyable = true,
  autoScroll = false,
  emptyMessage = '[INFO] System operational. No recent logs.',
  actions,
  className = '',
  id,
}) => {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = async () => {
    const rawText = logs
      .map((item) => {
        if (typeof item === 'string') return item;
        const parts = [];
        if (item.timestamp) parts.push(`[${item.timestamp}]`);
        if (item.level) parts.push(`[${item.level.toUpperCase()}]`);
        if (item.source) parts.push(`[${item.source}]`);
        parts.push(item.message);
        return parts.join(' ');
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  const getLevelClass = (level?: LogLevel) => {
    switch (level) {
      case 'info':
        return styles.levelInfo;
      case 'warn':
        return styles.levelWarn;
      case 'error':
        return styles.levelError;
      case 'success':
        return styles.levelSuccess;
      case 'debug':
        return styles.levelDebug;
      default:
        return '';
    }
  };

  const parseStringLog = (logStr: string) => {
    let level: LogLevel | undefined;
    if (logStr.includes('[INFO]') || logStr.startsWith('INFO:')) level = 'info';
    else if (logStr.includes('[WARN]') || logStr.startsWith('WARN:')) level = 'warn';
    else if (logStr.includes('[ERROR]') || logStr.startsWith('ERROR:')) level = 'error';
    else if (logStr.includes('[SUCCESS]') || logStr.startsWith('SUCCESS:')) level = 'success';
    else if (logStr.includes('[DEBUG]') || logStr.startsWith('DEBUG:')) level = 'debug';

    return {
      message: logStr,
      level,
    };
  };

  const renderLogLine = (logItem: string | StructuredLog, index: number) => {
    if (typeof logItem === 'string') {
      const parsed = parseStringLog(logItem);
      return (
        <div key={`log-${index}`} className={styles.line}>
          <span className={parsed.level ? getLevelClass(parsed.level) : styles.message}>
            {logItem}
          </span>
        </div>
      );
    }

    const { timestamp, level, source, message } = logItem;
    return (
      <div key={logItem.id || `structured-log-${index}`} className={styles.line}>
        {timestamp && <span className={styles.timestamp}>[{timestamp}]</span>}
        {level && (
          <span className={`${styles.level} ${getLevelClass(level)}`}>[{level.toUpperCase()}]</span>
        )}
        {source && <span className={styles.source}>[{source}]</span>}
        <span className={styles.message}>{message}</span>
      </div>
    );
  };

  const isWindow = variant === 'window';

  const sizeClass =
    {
      sm: styles.bodySm,
      md: styles.bodyMd,
      lg: styles.bodyLg,
      full: styles.bodyFull,
    }[size] || styles.bodyMd;

  return (
    <div
      id={id}
      className={`${styles.terminal} ${isWindow ? styles.window : styles.flat} ${className}`}
    >
      {isWindow && (
        <div className={styles.header}>
          <div className={styles.windowControls}>
            <span className={`${styles.windowDot} ${styles.dotClose}`} />
            <span className={`${styles.windowDot} ${styles.dotMinimize}`} />
            <span className={`${styles.windowDot} ${styles.dotMaximize}`} />
          </div>

          <span className={styles.title}>{title}</span>

          <div className={styles.actions}>
            {actions}
            {copyable && (
              <button
                type="button"
                className={styles.copyButton}
                onClick={handleCopy}
                title="Copy logs to clipboard"
                aria-label="Copy logs"
              >
                {copied ? (
                  <>
                    <Check size={12} color="var(--status-success)" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={bodyRef} className={`${styles.body} ${sizeClass}`}>
        {logs.length > 0 ? (
          logs.map((log, i) => renderLogLine(log, i))
        ) : (
          <div className={styles.empty}>{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};
