import { redirect } from 'next/navigation';
import dashboardService from '@/services/dashboard_service';
import { getDashboardTierMeta } from '@/utils/tier_limits';
import { getGuildDashboardRoute } from '@/utils/navigation';

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

export interface DashboardOnboardingStep {
  num: string;
  title: string;
  desc: string;
  href: string;
  iconName: 'Settings' | 'Plus';
}

export function getDashboardOnboardingSteps(guildId?: string): DashboardOnboardingStep[] {
  return [
    {
      num: '01',
      title: 'Settings',
      desc: 'Configure language and default colors.',
      href: getGuildDashboardRoute(guildId, 'settings'),
      iconName: 'Settings',
    },
    {
      num: '02',
      title: 'Add Monitor',
      desc: 'Pick a platform and start monitoring.',
      href: getGuildDashboardRoute(guildId, 'monitors'),
      iconName: 'Plus',
    },
  ];
}
