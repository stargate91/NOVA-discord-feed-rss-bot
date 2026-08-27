import { Video, Radio, Tv, Gift, Gamepad2, Film, GitBranch, Rss } from 'lucide-react';
import type { TranslationKey } from '@/i18n';

export type PreviewPlatform =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'epic'
  | 'steam'
  | 'tmdb'
  | 'github'
  | 'rss';

export const PREVIEW_PLATFORMS = [
  { value: 'youtube', labelKey: 'home.platformYoutube' as TranslationKey, icon: Video },
  { value: 'twitch', labelKey: 'home.platformTwitch' as TranslationKey, icon: Radio },
  { value: 'kick', labelKey: 'home.platformKick' as TranslationKey, icon: Tv },
  { value: 'epic', labelKey: 'home.platformEpic' as TranslationKey, icon: Gift },
  { value: 'steam', labelKey: 'home.platformSteam' as TranslationKey, icon: Gamepad2 },
  { value: 'tmdb', labelKey: 'home.platformTmdb' as TranslationKey, icon: Film },
  { value: 'github', labelKey: 'home.platformGithub' as TranslationKey, icon: GitBranch },
  { value: 'rss', labelKey: 'home.platformRss' as TranslationKey, icon: Rss },
] as const;

export interface EmbedMockPayload {
  channelName: string;
  roleMention?: string;
  alertText?: string;
  alertUrl?: string;
  platformIcon?: string;
  accentColor: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  title: string;
  titleUrl: string;
  description?: string;
  metaLines?: string[];
  thumbnail?: string;
  image?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  accessoryButton?: { label: string; url?: string };
  buttons?: { label: string; url?: string }[];
  footer: {
    text: string;
    timestamp: string;
  };
}

export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const getEmbedMocks = (t: TranslateFn): Record<PreviewPlatform, EmbedMockPayload> => ({
  youtube: {
    channelName: 'why-files',
    roleMention: t('home.embedYoutubeRole'),
    alertText: t('home.embedYoutubeAlert'),
    alertUrl: 'https://youtu.be/QgXdkAMXIIk',
    platformIcon: '/images/brands/youtube.png',
    accentColor: '#FF0000',
    title: t('home.embedYoutubeTitle'),
    titleUrl: 'https://youtu.be/QgXdkAMXIIk',
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'The Why Files',
    },
    metaLines: [`**${t('home.embedFieldPublishedAt')}:**\n${t('home.embedYoutubePublishedValue')}`],
    accessoryButton: { label: t('home.embedBtnWatchYoutube'), url: 'https://youtu.be/QgXdkAMXIIk' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 18:20',
    },
  },
  twitch: {
    channelName: 'stream-alerts',
    roleMention: t('home.embedTwitchRole'),
    alertText: t('home.embedTwitchAlert'),
    alertUrl: 'https://twitch.tv/shroud',
    platformIcon: '/images/brands/twitch.png',
    accentColor: '#9146FF',
    title: t('home.embedTwitchTitle'),
    titleUrl: 'https://twitch.tv/shroud',
    description: t('home.embedTwitchDesc'),
    image:
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Shroud',
    },
    metaLines: [
      `**${t('home.embedFieldGame')}:** ${t('home.embedTwitchGameValue')}`,
      `**${t('home.embedFieldViewers')}:** ${t('home.embedTwitchViewersValue')}`,
    ],
    accessoryButton: { label: t('home.embedBtnWatchStream'), url: 'https://twitch.tv/shroud' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 14:32',
    },
  },
  kick: {
    channelName: 'kick-alerts',
    roleMention: t('home.embedKickRole'),
    alertText: t('home.embedKickAlert'),
    alertUrl: 'https://kick.com/westcol',
    platformIcon: '/images/brands/kick.png',
    accentColor: '#53FC18',
    title: t('home.embedKickTitle'),
    titleUrl: 'https://kick.com/westcol',
    description: t('home.embedKickDesc'),
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Westcol',
    },
    metaLines: [
      `**${t('home.embedFieldCategory')}:** ${t('home.embedKickCategoryValue')}`,
      `**${t('home.embedFieldViewers')}:** ${t('home.embedKickViewersValue')}`,
    ],
    accessoryButton: { label: t('home.embedBtnWatchKick'), url: 'https://kick.com/westcol' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Just now',
    },
  },
  epic: {
    channelName: 'free-games',
    roleMention: t('home.embedEpicRole'),
    alertText: t('home.embedEpicAlert'),
    alertUrl: 'https://store.epicgames.com',
    platformIcon: '/images/brands/epic_games.png',
    accentColor: '#0078F2',
    title: t('home.embedEpicTitle'),
    titleUrl: 'https://store.epicgames.com',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    metaLines: [
      `**${t('home.embedFieldWorth')}:** ${t('home.embedEpicWorthValue')}`,
      `**${t('home.embedFieldType')}:** ${t('home.embedEpicTypeValue')}`,
      `**${t('home.embedFieldExpiry')}:** ${t('home.embedEpicExpiryValue')}`,
    ],
    accessoryButton: { label: t('home.embedBtnGetGame'), url: 'https://store.epicgames.com' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 17:00',
    },
  },
  steam: {
    channelName: 'steam-deals',
    roleMention: t('home.embedSteamRole'),
    alertText: t('home.embedSteamAlert'),
    alertUrl: 'https://store.steampowered.com',
    platformIcon: '/images/brands/steam.png',
    accentColor: '#1A9FFF',
    title: t('home.embedSteamTitle'),
    titleUrl: 'https://store.steampowered.com',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    metaLines: [
      `**${t('home.embedFieldWorth')}:** ${t('home.embedSteamWorthValue')}`,
      `**${t('home.embedFieldType')}:** ${t('home.embedSteamTypeValue')}`,
      `**${t('home.embedFieldExpiry')}:** ${t('home.embedSteamExpiryValue')}`,
    ],
    accessoryButton: { label: t('home.embedBtnGetSteam'), url: 'https://store.steampowered.com' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 17:15',
    },
  },
  tmdb: {
    channelName: 'movies-and-shows',
    roleMention: t('home.embedTmdbRole'),
    alertText: t('home.embedTmdbAlert'),
    alertUrl: 'https://themoviedb.org',
    platformIcon: '/images/brands/tmdb.png',
    accentColor: '#01D277',
    title: t('home.embedTmdbTitle'),
    titleUrl: 'https://themoviedb.org',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    metaLines: [
      `**${t('home.embedFieldGenres')}:** ${t('home.embedTmdbGenresValue')}`,
      `**${t('home.embedFieldScore')}:** ${t('home.embedTmdbScoreValue')}`,
      `**${t('home.embedFieldReleaseDate')}:** ${t('home.embedTmdbReleaseValue')}`,
    ],
    buttons: [
      { label: t('home.embedBtnViewTmdb'), url: 'https://themoviedb.org' },
      { label: t('home.embedBtnWatchTrailer'), url: 'https://youtube.com' },
    ],
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 10:15',
    },
  },
  github: {
    channelName: 'github-releases',
    roleMention: t('home.embedGithubRole'),
    alertText: t('home.embedGithubAlert'),
    alertUrl: 'https://github.com/tiangolo/fastapi',
    platformIcon: '/images/brands/github.png',
    accentColor: '#E6EDF3',
    title: t('home.embedGithubTitle'),
    titleUrl: 'https://github.com/tiangolo/fastapi',
    description: t('home.embedGithubDesc'),
    author: {
      name: 'tiangolo',
    },
    metaLines: [`**${t('home.embedFieldPublishedAt')}:**\n${t('home.embedGithubPublishedValue')}`],
    accessoryButton: { label: t('home.embedBtnViewGithub'), url: 'https://github.com/tiangolo/fastapi' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: 'Today at 12:45',
    },
  },
  rss: {
    channelName: 'tech-news',
    roleMention: t('home.embedRssRole'),
    alertText: t('home.embedRssAlert'),
    alertUrl: 'https://techcrunch.com',
    platformIcon: '/images/brands/rss.png',
    accentColor: '#F5B000',
    title: t('home.embedRssTitle'),
    titleUrl: 'https://techcrunch.com',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'TechCrunch',
    },
    metaLines: [`**${t('home.embedFieldPublishedAt')}:**\n${t('home.embedRssPublishedValue')}`],
    accessoryButton: { label: t('home.embedBtnReadArticle'), url: 'https://techcrunch.com' },
    footer: {
      text: t('home.embedDeliveredBy'),
      timestamp: '5 mins ago',
    },
  },
});
