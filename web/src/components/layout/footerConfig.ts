import type { TranslationKey } from '@/i18n';
import { DISCORD_SUPPORT_SERVER_URL } from '@/constants';

export interface FooterLinkItem {
  path?: string;
  externalUrl?: string;
  labelKey: TranslationKey;
  isDev?: boolean;
}

export const FOOTER_RESOURCES_LINKS: FooterLinkItem[] = [
  { path: '/docs', labelKey: 'common.navDocs' },
  { path: '/premium', labelKey: 'common.navPremium' },
  { path: '/changelog', labelKey: 'common.navChangelog' },
  { path: '/support', labelKey: 'common.navSupport' },
];

export const FOOTER_LEGAL_LINKS: FooterLinkItem[] = [
  { path: '/terms', labelKey: 'legal.termsTitleHighlight' },
  { path: '/privacy', labelKey: 'legal.privacyTitleHighlight' },
  { externalUrl: DISCORD_SUPPORT_SERVER_URL, labelKey: 'support.discordCta' },
];
