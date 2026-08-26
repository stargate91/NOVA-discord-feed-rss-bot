import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import analyticsService, { AnalyticsData } from '@/services/analytics_service';
import { useGuildContext } from '@/context/guild_context';
import { formatShortDate } from '@/utils/date';
import { getGuildDashboardRoute } from '@/utils/navigation';
import { extractErrorMessage } from '@/utils/toast';

export function useGuildAnalytics(guildId: string) {
  const router = useRouter();
  const { tierContext } = useGuildContext();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState(String(tierContext.maxAnalyticsDays || 3));
  const [hasSetDefaultRange, setHasSetDefaultRange] = useState(false);

  const isRangeLocked = useCallback(
    (val: string) => tierContext.isAnalyticsRangeLocked(val),
    [tierContext]
  );

  useEffect(() => {
    if (!guildId) {
      router.push('/servers');
      return;
    }

    let ignore = false;
    async function fetchStats() {
      setLoading(true);
      try {
        const json = await analyticsService.getStats(guildId!, range);
        if (!ignore) {
          setData(json);

          if (!hasSetDefaultRange && json) {
            setRange(String(tierContext.maxAnalyticsDays));
            setHasSetDefaultRange(true);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(extractErrorMessage(err, 'Failed to load analytics'));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [guildId, range, router, hasSetDefaultRange, tierContext.maxAnalyticsDays]);

  const chartData = useMemo(() => {
    if (!data || !data.history) return [];
    return data.history.map((item) => ({
      date: formatShortDate(item.date),
      posts: parseInt(String(item.count), 10),
    }));
  }, [data]);

  const growthRate = useMemo(() => {
    return data?.trend?.growthRate ?? 0;
  }, [data]);

  const trendData = useMemo(() => {
    if (!data?.trend || data.trend.growthRate === 0) return undefined;
    return {
      value: data.trend.value,
      isPositive: data.trend.isPositive,
    };
  }, [data]);

  const formattedPlatforms = useMemo(() => {
    if (!data?.platforms) return [];
    return data.platforms.map((p) => ({
      id: p.id || p.platform,
      name: p.name || p.displayName || p.platform,
      count: Number(p.count) || 0,
      percentage: p.percentage ?? 0,
    }));
  }, [data]);

  const heatmapMatrix = useMemo(() => {
    return data?.heatmapMatrix;
  }, [data]);

  const handleRangeChange = useCallback(
    (val: string) => {
      if (isRangeLocked(val)) {
        router.push(getGuildDashboardRoute(guildId, 'billing'));
        return;
      }
      setRange(val);
    },
    [isRangeLocked, router, guildId]
  );

  return {
    data,
    loading,
    error,
    range,
    setRange,
    isRangeLocked,
    handleRangeChange,
    chartData,
    growthRate,
    trendData,
    formattedPlatforms,
    heatmapMatrix,
  };
}

export default useGuildAnalytics;
