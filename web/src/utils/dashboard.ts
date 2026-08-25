import { redirect } from 'next/navigation';
import dashboardService from '@/services/dashboard_service';
import { getDashboardTierMeta } from '@/utils/tier_limits';

export interface GuildDashboardData {
  stats: any;
  tierMeta: ReturnType<typeof getDashboardTierMeta>;
  error?: string;
}

export async function getGuildDashboardData(
  guildId: string,
  session: any
): Promise<GuildDashboardData> {
  if (!session) {
    redirect('/');
  }

  if (!guildId) {
    redirect('/servers');
  }

  const stats: any = await dashboardService.getGuildStats(guildId, session);

  if (stats?.error) {
    return {
      stats: null,
      tierMeta: getDashboardTierMeta(null),
      error: stats.error,
    };
  }

  const tierMeta = getDashboardTierMeta(stats);

  return {
    stats,
    tierMeta,
  };
}
