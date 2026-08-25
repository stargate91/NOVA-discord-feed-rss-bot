import { useState, useEffect, useCallback } from 'react';
import devService from '@/services/dev_service';

export function useLogStream(pollIntervalMs: number = 3000) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await devService.getLogs(100);
      if (data.logs) {
        setLogs(data.logs);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const runFetch = async () => {
      try {
        const data = await devService.getLogs(100);
        if (!ignore) {
          if (data.logs) {
            setLogs(data.logs);
            setError(null);
          } else if (data.error) {
            setError(data.error);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          console.error('Failed to fetch logs:', err);
          setError(err?.message || String(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    runFetch();

    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLive) {
      interval = setInterval(runFetch, pollIntervalMs);
    }

    return () => {
      ignore = true;
      if (interval) clearInterval(interval);
    };
  }, [isLive, pollIntervalMs]);

  const clearLogs = () => {
    setLogs([]);
    setError(null);
  };

  return {
    logs,
    isLive,
    setIsLive,
    isExpanded,
    setIsExpanded,
    loading,
    error,
    fetchLogs,
    clearLogs,
  };
}
