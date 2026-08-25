import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import analyticsService, { AnalyticsData } from '@/services/analytics_service';
import { calculatePeriodGrowthRate, formatPlatformBreakdown } from '@/utils/analytics';

export function useGuildAnalytics(guildId: string) {
  const router = useRouter();
  const { data: session } = useSession();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('3');
  const [hasSetDefaultRange, setHasSetDefaultRange] = useState(false);

  const isRangeLocked = useCallback(
    (val: string) => {
      if ((session?.user as any)?.role === 'master') return false;
      if (!data) return true;
      if (data.isMaster || (data.tier ?? 0) >= 3) return false;

      const limit = data.maxAllowedDays ?? analyticsService.getTierLimit(data.tier || 0);
      return parseInt(val, 10) > limit;
    },
    [session, data]
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
            const limit =
              (session?.user as any)?.role === 'master' ||
              json.isMaster ||
              (json.tier ?? 0) >= 3
                ? 999
                : json.maxAllowedDays ?? analyticsService.getTierLimit(json.tier || 0);
            setRange(String(limit));
            setHasSetDefaultRange(true);
          }
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.message || 'Failed to fetch analytics');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [guildId, range, router, session, hasSetDefaultRange]);

  const chartData = useMemo(() => {
    if (!data || !data.history) return [];
    return data.history.map((item) => ({
      date: new Date(item.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
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
