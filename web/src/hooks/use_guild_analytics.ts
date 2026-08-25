import { useState, useEffect, useMemo } from 'react';
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

  const isRangeLocked = (val: string) => {
    if ((session?.user as any)?.role === 'master') return false;
    if (!data) return true;
    if (data.isMaster || (data.tier ?? 0) >= 3) return false;

    const limit = analyticsService.getTierLimit(data.tier || 0);
    return parseInt(val, 10) > limit;
  };

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
                : analyticsService.getTierLimit(json.tier || 0);
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
    return calculatePeriodGrowthRate(data?.history || []);
  }, [data]);

  const formattedPlatforms = useMemo(() => {
    return formatPlatformBreakdown(data?.platforms || [], data?.totalPosts || 0);
  }, [data]);

  return {
    data,
    loading,
    error,
    range,
    setRange,
    isRangeLocked,
    chartData,
    growthRate,
    formattedPlatforms,
  };
}
