import { PlatformMetadata, BulkPlatformMetadata, GenreItem } from '@/types/monitor';

export type KnownPlatformId =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'epic_games'
  | 'steam_free'
  | 'steam_news'
  | 'gog_free'
  | 'movie'
  | 'tv_series'
  | 'github'
  | 'crypto'
  | 'rss';

export type MonitorPlatform = KnownPlatformId | (string & {});

export interface TemplatePlatform {
  id: string;
  name: string;
  icon: string;
  tags: string[];
}

export interface CarouselPlatformItem {
  id: string;
  name: string;
  icon: string;
}

export interface PlatformRegistryItem {
  id: KnownPlatformId;
  aliases?: string[];
  name: string;
  logo: string;
  color: string;
  description: string;
  isGlobal?: boolean;
  isCrypto?: boolean;
  inputLabel?: string;
  inputKey?: string;
  placeholder?: string;
  hint?: string;
  bulkPlaceholder?: string;
  bulkHint?: string;
  supportsNativePlayer?: boolean;
  supportsLiveAlerts?: boolean;
  supportsMediaFilters?: boolean;
  supportsUpcomingGames?: boolean;
  supportsAutocomplete?: boolean;
  tags: string[];
  inCarousel?: boolean;
  carouselName?: string;
}

export const PLATFORM_REGISTRY: Record<KnownPlatformId, PlatformRegistryItem> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    logo: '/brands/youtube.png',
    color: '#FF0000',
    description: 'Monitor a channel for new videos.',
    inputLabel: 'Channel Info',
    inputKey: 'channel_id',
    placeholder: '@handle, Link or Name',
    hint: 'Format: @handle, channel link, name or UCID.',
    bulkPlaceholder: 'https://youtube.com/@handle\n@username\nUCID',
    bulkHint: 'Links, @handles or UCIDs',
    supportsNativePlayer: true,
    tags: ['{name}', '{title}'],
    inCarousel: true,
  },
  twitch: {
    id: 'twitch',
    aliases: ['stream'],
    name: 'Twitch',
    logo: '/brands/twitch.png',
    color: '#9146FF',
    description: 'Go live alerts for Twitch streamers.',
    inputLabel: 'Username',
    inputKey: 'username',
    placeholder: 'twitch_user',
    hint: 'Format: Username or Channel Link.',
    bulkPlaceholder: 'twitch_user\nhttps://twitch.tv/user',
    bulkHint: 'Usernames or Links',
    supportsLiveAlerts: true,
    supportsAutocomplete: true,
    tags: ['{name}', '{game}', '{title}', '{viewers}', '{platform}'],
    inCarousel: true,
  },
  kick: {
    id: 'kick',
    name: 'Kick',
    logo: '/brands/kick.png',
    color: '#53fc18',
    description: 'Go live alerts for Kick streamers.',
    inputLabel: 'Username',
    inputKey: 'username',
    placeholder: 'kick_user',
    hint: 'Format: Username or Channel Link.',
    bulkPlaceholder: 'kick_user\nhttps://kick.com/user',
    bulkHint: 'Usernames or Links',
    supportsLiveAlerts: true,
    tags: ['{name}', '{game}', '{title}', '{viewers}', '{platform}'],
    inCarousel: true,
  },
  epic_games: {
    id: 'epic_games',
    aliases: ['epic', 'epic-games'],
    name: 'Epic Free',
    carouselName: 'Epic Games',
    logo: '/brands/epic-games.png',
    color: '#ffffff',
    description: 'Weekly free games from Epic Store.',
    isGlobal: true,
    supportsUpcomingGames: true,
    tags: ['{name}', '{title}'],
    inCarousel: true,
  },
  steam_free: {
    id: 'steam_free',
    name: 'Steam Free',
    logo: '/brands/steam.png',
    color: '#66c0f4',
    description: 'New free games discovered on Steam.',
    isGlobal: true,
    tags: ['{name}', '{title}'],
  },
  steam_news: {
    id: 'steam_news',
    aliases: ['steam'],
    name: 'Steam News',
    carouselName: 'Steam',
    logo: '/brands/steam.png',
    color: '#66c0f4',
    description: 'Game updates and news from Steam.',
    inputLabel: 'Steam Game',
    inputKey: 'app_id',
    placeholder: 'Dota 2, 730 or Link',
    hint: 'Format: Game Name, App ID or Store URL.',
    bulkPlaceholder: '730\nhttps://store.steampowered.com/app/730',
    bulkHint: 'App IDs or Store URLs',
    supportsAutocomplete: true,
    tags: ['{name}', '{author}', '{title}'],
    inCarousel: true,
  },
  gog_free: {
    id: 'gog_free',
    aliases: ['gog'],
    name: 'GOG Free',
    carouselName: 'GOG',
    logo: '/brands/gog.png',
    color: '#b237c1',
    description: 'Limited time free offers on GOG.com.',
    isGlobal: true,
    tags: ['{name}', '{title}'],
  },
  movie: {
    id: 'movie',
    aliases: ['tmdb'],
    name: 'Movies',
    logo: '/brands/tmdb.png',
    color: '#00d1b2',
    description: 'Trending and new popular movies.',
    isGlobal: true,
    supportsMediaFilters: true,
    tags: ['{name}', '{title}', '{rating}', '{year}'],
  },
  tv_series: {
    id: 'tv_series',
    aliases: ['tv'],
    name: 'TV Series',
    logo: '/brands/tmdb.png',
    color: '#3273dc',
    description: 'Daily trending and new TV shows.',
    isGlobal: true,
    supportsMediaFilters: true,
    tags: ['{name}', '{title}', '{rating}', '{year}'],
  },
  github: {
    id: 'github',
    name: 'GitHub',
    logo: '/brands/github.png',
    color: '#fafafa',
    description: 'New releases or commits from a repo.',
    inputLabel: 'Repository',
    inputKey: 'repo',
    placeholder: 'owner/repo',
    hint: 'Format: "owner/repo" or Repository URL.',
    bulkPlaceholder: 'owner/repo\nhttps://github.com/owner/repo',
    bulkHint: '"owner/repo" or Links',
    supportsAutocomplete: true,
    tags: ['{name}', '{author}', '{title}', '{version}'],
    inCarousel: true,
  },
  crypto: {
    id: 'crypto',
    name: 'Crypto',
    logo: '/brands/crypto.png',
    color: '#f3ba2f',
    description: 'Price alerts and coin news.',
    isCrypto: true,
    tags: ['{name}', '{price}', '{threshold}', '{direction}', '{percent}'],
    inCarousel: true,
  },
  rss: {
    id: 'rss',
    name: 'RSS Feed',
    logo: '/brands/rss.png',
    color: '#ee802f',
    description: 'Generic RSS/Atom feed monitoring.',
    inputLabel: 'Feed URL',
    inputKey: 'rss_url',
    placeholder: 'https://example.com/feed',
    hint: 'Format: Full URL (e.g. https://site.com/feed.xml).',
    bulkPlaceholder: 'https://site.com/feed.xml\nhttps://blog.com/rss',
    bulkHint: 'Full RSS/Atom URLs',
    tags: ['{name}', '{author}', '{title}', '{description}'],
    inCarousel: true,
  },
};

/**
 * Normalizes any alias to its canonical platform ID (e.g., 'stream' -> 'twitch').
 */
export function normalizePlatformId(rawId?: string | null): string {
  if (!rawId) return '';
  const clean = rawId.toLowerCase().trim();
  const registry: Record<string, PlatformRegistryItem> = PLATFORM_REGISTRY;
  if (registry[clean]) return clean;
  for (const [key, item] of Object.entries(registry)) {
    if (item.aliases?.includes(clean)) return key;
  }
  return clean;
}

/**
 * Retrieves the platform registry item or null if not found.
 */
export function getPlatformRegistryItem(rawId?: string | null): PlatformRegistryItem | null {
  const normId = normalizePlatformId(rawId);
  const registry: Record<string, PlatformRegistryItem> = PLATFORM_REGISTRY;
  return registry[normId] || null;
}

export const CAROUSEL_PLATFORMS: CarouselPlatformItem[] = Object.values(PLATFORM_REGISTRY)
  .filter((p) => p.inCarousel)
  .map((p) => ({
    id: p.id,
    name: p.carouselName || p.name,
    icon: p.logo,
  }));

export const INFINITE_CAROUSEL_PLATFORMS: CarouselPlatformItem[] = [
  ...CAROUSEL_PLATFORMS,
  ...CAROUSEL_PLATFORMS,
  ...CAROUSEL_PLATFORMS,
];

export const PLATFORMS: PlatformMetadata[] = Object.values(PLATFORM_REGISTRY).map((p) => ({
  id: p.id,
  name: p.name,
  logo: p.logo,
  color: p.color,
  description: p.description,
  isGlobal: p.isGlobal,
  isCrypto: p.isCrypto,
  inputLabel: p.inputLabel,
  inputKey: p.inputKey,
  placeholder: p.placeholder,
  hint: p.hint,
}));

export const BULK_PLATFORMS: BulkPlatformMetadata[] = [
  PLATFORM_REGISTRY.youtube,
  PLATFORM_REGISTRY.twitch,
  PLATFORM_REGISTRY.kick,
  PLATFORM_REGISTRY.rss,
  PLATFORM_REGISTRY.github,
  PLATFORM_REGISTRY.steam_news,
].map((p) => ({
  id: p.id,
  name: p.name,
  logo: p.logo,
  color: p.color,
  placeholder: p.bulkPlaceholder || '',
  hint: p.bulkHint || '',
}));

export const PLATFORM_NAMES: Record<string, string> = {
  ...Object.fromEntries(
    Object.values(PLATFORM_REGISTRY).flatMap((p) => [
      [p.id, p.name],
      ...(p.aliases?.map((alias) => [alias, p.name]) || []),
    ])
  ),
};


export const TEMPLATE_PLATFORMS: TemplatePlatform[] = Object.values(PLATFORM_REGISTRY).map((p) => ({
  id: p.id,
  name: p.name === 'Crypto' ? 'Crypto Alerts' : p.name,
  icon: p.logo,
  tags: p.tags,
}));

export const TAG_DESCRIPTIONS: Record<string, string> = {
  '{name}': 'Platform, Channel or Monitor name',
  '{title}': 'Content title, Stream title or Video title',
  '{description}': 'Short summary or description (mostly RSS)',
  '{price}': 'Current cryptocurrency price (USD)',
  '{threshold}': 'The price limit you set',
  '{direction}': 'Up or Down direction emoji',
  '{percent}': 'Percentage difference from threshold',
  '{game}': 'The game currently being played',
  '{viewers}': 'Current viewer count',
  '{platform}': 'Platform name (Twitch or Kick)',
  '{author}': 'Author or creator name (RSS/Steam/GitHub)',
  '{version}': 'Release version or tag name (GitHub)',
  '{rating}': 'Movie or TV Show rating (e.g., 8.5)',
  '{year}': 'Release year of the content',
};

export const getAvailableVars = (platformId: string): string[] => {
  const item = getPlatformRegistryItem(platformId);
  if (!item) return ['name'];
  return item.tags.map((t) => t.replace(/^\{|\}$/g, ''));
};

export const MOVIE_GENRES: GenreItem[] = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '9999', name: 'Anime' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' },
  { id: '10759', name: 'Action & Adventure (TV)' },
  { id: '10762', name: 'Kids (TV)' },
  { id: '10765', name: 'Sci-Fi & Fantasy (TV)' }
];
