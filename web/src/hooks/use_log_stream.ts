import { useState, useEffect, useCallback, useRef } from 'react';
import devService from '@/services/dev_service';
import { StructuredLogEntry } from '@/utils/log';
import { extractErrorMessage } from '@/utils/toast';

export function useLogStream(pollIntervalMs: number = 3000) {
  const [logs, setLogs] = useState<StructuredLogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current && !error) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, error]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await devService.getLogs(100);
      if (!isMountedRef.current) return;

      if (data.logs) {
        setLogs(data.logs);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      console.error('Failed to fetch logs:', err);
      setError(extractErrorMessage(err, 'Failed to fetch logs'));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!ignore) {
        await fetchLogs();
      }
    };

    load();

    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLive) {
      interval = setInterval(() => {
        if (!ignore) {
          fetchLogs();
        }
      }, pollIntervalMs);
    }

    return () => {
      ignore = true;
      if (interval) clearInterval(interval);
    };
  }, [isLive, pollIntervalMs, fetchLogs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  return {
    logs,
    isLive,
    setIsLive,
    isExpanded,
    setIsExpanded,
    loading,
    error,
    scrollRef,
    fetchLogs,
    clearLogs,
  };
}

