import type { UserGuild } from './types';

export const DEFAULT_DEMO_GUILDS: UserGuild[] = [
  {
    id: '123456789012345678',
    name: 'Stargate Gaming Lounge',
    icon: null,
    owner: true,
    permissions: '8',
    hasManagePermission: true,
    tier: 'professional',
    monitorsCount: 4,
  },
  {
    id: '987654321098765432',
    name: 'Creator Hub VIP',
    icon: null,
    owner: true,
    permissions: '8',
    hasManagePermission: true,
    tier: 'ultimate',
    monitorsCount: 8,
  },
];

export const ACTIVE_GUILD_STORAGE_KEY = 'nova_active_guild_id';
