import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import analyticsService, { AnalyticsData } from '@/services/analytics_service';
import { calculatePeriodGrowthRate, formatPlatformBreakdown } from '@/utils/analytics';
import { useGuildContext } from '@/context/guild_context';
import { formatShortDate } from '@/utils/date';


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
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || 'Failed to load analytics');
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
    if (data?.trend) {
      return data.trend.growthRate;
    }
    return calculatePeriodGrowthRate(data?.history || []);
  }, [data]);

  const trendData = useMemo(() => {
    if (data?.trend) {
      if (data.trend.growthRate === 0) return undefined;
      return {
        value: data.trend.value,
        isPositive: data.trend.isPositive,
      };
    }
    if (growthRate === 0) return undefined;
    return {
      value: Math.abs(growthRate),
      isPositive: growthRate >= 0,
    };
  }, [data, growthRate]);

  const formattedPlatforms = useMemo(() => {
    if (!data?.platforms || data.platforms.length === 0) return [];
    // If backend already formatted with percentage and name
    if (typeof data.platforms[0]?.percentage === 'number') {
      return data.platforms.map((p) => ({
        id: p.id || p.platform,
        name: p.name || p.displayName || p.platform,
        count: Number(p.count) || 0,
        percentage: p.percentage ?? 0,
      }));
    }
    return formatPlatformBreakdown(data.platforms, data.totalPosts || 0);
  }, [data]);

  const heatmapMatrix = useMemo(() => {
    return data?.heatmapMatrix;
  }, [data]);

  const handleRangeChange = useCallback(
    (val: string) => {
      if (isRangeLocked(val)) {
        router.push(`/dashboard/${guildId}/billing`);
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
