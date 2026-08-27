import { guildSidebar } from './sidebar';
import { guildOverview } from './overview';
import { guildFeeds } from './feeds';
import { guildAnalytics } from './analytics';
import { guildPremium } from './premium';
import { guildSettings } from './settings';
import { guildToasts } from './toasts';

export const guild = {
  ...guildSidebar,
  ...guildOverview,
  ...guildFeeds,
  ...guildAnalytics,
  ...guildPremium,
  ...guildSettings,
  ...guildToasts,
} as const;
