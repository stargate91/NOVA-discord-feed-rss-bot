import { Video, Radio, Gamepad2, GitBranch } from 'lucide-react';
import type { TranslationKey } from '@/i18n';

export type PreviewPlatform = 'youtube' | 'twitch' | 'steam' | 'github';

export const PREVIEW_PLATFORMS = [
  { value: 'youtube', labelKey: 'home.platformYoutube' as TranslationKey, icon: Video },
  { value: 'twitch', labelKey: 'home.platformTwitch' as TranslationKey, icon: Radio },
  { value: 'steam', labelKey: 'home.platformSteam' as TranslationKey, icon: Gamepad2 },
  { value: 'github', labelKey: 'home.platformGithub' as TranslationKey, icon: GitBranch },
] as const;

export interface EmbedMockPayload {
  author: {
    name: string;
    icon_url: string;
    url: string;
  };
  title: string;
  titleUrl: string;
  description: string;
  thumbnail: string;
  image?: string;
  fields: { name: string; value: string; inline?: boolean }[];
  footer: {
    text: string;
    timestamp: string;
  };
}

export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const getEmbedMocks = (t: TranslateFn): Record<PreviewPlatform, EmbedMockPayload> => ({
  youtube: {
    author: {
      name: 'MrBeast (YouTube)',
      icon_url: '/images/brands/youtube.png',
      url: 'https://youtube.com',
    },
    title: t('home.embedYoutubeTitle'),
    titleUrl: 'https://youtube.com',
    description: t('home.embedYoutubeDesc'),
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    fields: [
      { name: t('home.embedYoutubeFieldChannel'), value: '@MrBeast', inline: true },
      { name: t('home.embedYoutubeFieldDuration'), value: '18:42', inline: true },
      { name: t('home.embedYoutubeFieldUploadTime'), value: '2 mins ago', inline: true },
    ],
    footer: {
      text: t('home.embedYoutubeFooter'),
      timestamp: 'Today at 18:00',
    },
  },
  twitch: {
    author: {
      name: 'Shroud (Twitch)',
      icon_url: '/images/brands/twitch.png',
      url: 'https://twitch.tv',
    },
    title: t('home.embedTitle'),
    titleUrl: 'https://twitch.tv',
    description: t('home.embedDescription'),
    thumbnail:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=60',
    image:
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    fields: [
      { name: t('home.embedTwitchFieldCategory'), value: 'VALORANT', inline: true },
      { name: t('home.embedTwitchFieldViewers'), value: '24,510 Viewers', inline: true },
      { name: t('home.embedTwitchFieldUptime'), value: 'Live for 14 mins', inline: true },
    ],
    footer: {
      text: t('home.embedFooter'),
      timestamp: t('home.embedTimestamp'),
    },
  },
  steam: {
    author: {
      name: 'Steam Deals Tracker',
      icon_url: '/images/brands/steam.png',
      url: 'https://store.steampowered.com',
    },
    title: t('home.embedSteamTitle'),
    titleUrl: 'https://store.steampowered.com',
    description: t('home.embedSteamDesc'),
    thumbnail:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    fields: [
      { name: t('home.embedSteamOriginalPrice'), value: '~~$29.99~~', inline: true },
      { name: t('home.embedSteamDiscountPrice'), value: '**FREE ($0.00)**', inline: true },
      { name: t('home.embedSteamExpiry'), value: 'Sunday at 18:00 UTC', inline: true },
    ],
    footer: {
      text: t('home.embedSteamFooter'),
      timestamp: 'Today at 17:15',
    },
  },
  github: {
    author: {
      name: 'FastAPI (GitHub)',
      icon_url: '/images/brands/github.png',
      url: 'https://github.com',
    },
    title: t('home.embedGithubTitle'),
    titleUrl: 'https://github.com',
    description: t('home.embedGithubDesc'),
    thumbnail:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=60',
    image: undefined,
    fields: [
      { name: t('home.embedGithubFieldTag'), value: 'v0.115.0', inline: true },
      { name: t('home.embedGithubFieldCommit'), value: '`7b3d2ef`', inline: true },
      { name: t('home.embedGithubFieldAssets'), value: '4 binaries attached', inline: true },
    ],
    footer: {
      text: t('home.embedGithubFooter'),
      timestamp: 'Today at 12:45',
    },
  },
});
