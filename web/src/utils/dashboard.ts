import { getGuildDashboardRoute } from '@/utils/navigation';

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
