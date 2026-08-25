import { PlatformMetadata, BulkPlatformMetadata, GenreItem } from '@/types/monitor';
import { getPlatformLogo } from '@/utils/platform';

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

export const CAROUSEL_PLATFORMS: CarouselPlatformItem[] = [
  { id: 'youtube', name: 'YouTube', icon: '/brands/youtube.png' },
  { id: 'twitch', name: 'Twitch', icon: '/brands/twitch.png' },
  { id: 'kick', name: 'Kick', icon: '/brands/kick.png' },
  { id: 'epic-games', name: 'Epic Games', icon: '/brands/epic-games.png' },
  { id: 'steam', name: 'Steam', icon: '/brands/steam.png' },
  { id: 'rss', name: 'RSS', icon: '/brands/rss.png' },
  { id: 'github', name: 'GitHub', icon: '/brands/github.png' },
  { id: 'crypto', name: 'Crypto', icon: '/brands/crypto.png' },
];

export const PLATFORMS: PlatformMetadata[] = [
  // Content & Streaming
  { id: 'youtube', name: 'YouTube', logo: '/brands/youtube.png', color: '#FF0000', description: 'Monitor a channel for new videos.', inputLabel: 'Channel Info', inputKey: 'channel_id', placeholder: '@handle, Link or Name', hint: 'Format: @handle, channel link, name or UCID.' },
  { id: 'twitch', name: 'Twitch', logo: '/brands/twitch.png', color: '#9146FF', description: 'Go live alerts for Twitch streamers.', inputLabel: 'Username', inputKey: 'username', placeholder: 'twitch_user', hint: 'Format: Username or Channel Link.' },
  { id: 'kick', name: 'Kick', logo: '/brands/kick.png', color: '#53fc18', description: 'Go live alerts for Kick streamers.', inputLabel: 'Username', inputKey: 'username', placeholder: 'kick_user', hint: 'Format: Username or Channel Link.' },

  // Gaming
  { id: 'epic_games', name: 'Epic Free', logo: '/brands/epic-games.png', color: '#ffffff', description: 'Weekly free games from Epic Store.', isGlobal: true },
  { id: 'steam_free', name: 'Steam Free', logo: '/brands/steam.png', color: '#66c0f4', description: 'New free games discovered on Steam.', isGlobal: true },
  { id: 'steam_news', name: 'Steam News', logo: '/brands/steam.png', color: '#66c0f4', description: 'Game updates and news from Steam.', inputLabel: 'Steam Game', inputKey: 'app_id', placeholder: 'Dota 2, 730 or Link', hint: 'Format: Game Name, App ID or Store URL.' },
  { id: 'gog_free', name: 'GOG Free', logo: '/brands/gog.png', color: '#b237c1', description: 'Limited time free offers on GOG.com.', isGlobal: true },

  // Entertainment
  { id: 'movie', name: 'Movies', logo: '/brands/tmdb.png', color: '#00d1b2', description: 'Trending and new popular movies.', isGlobal: true },
  { id: 'tv_series', name: 'TV Series', logo: '/brands/tmdb.png', color: '#3273dc', description: 'Daily trending and new TV shows.', isGlobal: true },

  // Tech & General
  { id: 'github', name: 'GitHub', logo: '/brands/github.png', color: '#ffffff', description: 'New releases or commits from a repo.', inputLabel: 'Repository', inputKey: 'repo', placeholder: 'owner/repo', hint: 'Format: "owner/repo" or Repository URL.' },
  { id: 'crypto', name: 'Crypto', logo: '/brands/crypto.png', color: '#F7931A', description: 'Price alerts and coin news.', isCrypto: true },
  { id: 'rss', name: 'RSS Feed', logo: '/brands/rss.png', color: '#ee802f', description: 'Generic RSS/Atom feed monitoring.', inputLabel: 'Feed URL', inputKey: 'rss_url', placeholder: 'https://example.com/feed', hint: 'Format: Full URL (e.g. https://site.com/feed.xml).' }
];

export const BULK_PLATFORMS: BulkPlatformMetadata[] = [
  { id: 'youtube', name: 'YouTube', logo: '/brands/youtube.png', color: '#ff0000', placeholder: 'https://youtube.com/@handle\n@username\nUCID', hint: 'Links, @handles or UCIDs' },
  { id: 'stream', name: 'Twitch', logo: '/brands/twitch.png', color: '#9146ff', placeholder: 'twitch_user\nhttps://twitch.tv/user', hint: 'Usernames or Links' },
  { id: 'kick', name: 'Kick', logo: '/brands/kick.png', color: '#53fc18', placeholder: 'kick_user\nhttps://kick.com/user', hint: 'Usernames or Links' },
  { id: 'rss', name: 'RSS Feed', logo: '/brands/rss.png', color: '#ee802f', placeholder: 'https://site.com/feed.xml\nhttps://blog.com/rss', hint: 'Full RSS/Atom URLs' },
  { id: 'github', name: 'GitHub', logo: '/brands/github.png', color: '#fafafa', placeholder: 'owner/repo\nhttps://github.com/owner/repo', hint: '"owner/repo" or Links' },
  { id: 'steam_news', name: 'Steam News', logo: '/brands/steam.png', color: '#66c0f4', placeholder: '730\nhttps://store.steampowered.com/app/730', hint: 'App IDs or Store URLs' },
];

export const PLATFORM_NAMES: Record<string, string> = {
  youtube: "YouTube",
  rss: "RSS",
  epic_games: "Epic Games",
  steam_free: "Steam Free",
  gog_free: "GOG",
  stream: "Twitch",
  twitch: "Twitch",
  kick: "Kick",
  steam_news: "Steam News",
  movie: "TMDB Movies",
  tv_series: "TMDB Series",
  crypto: "Crypto",
  github: "GitHub"
};

export const TEMPLATE_PLATFORMS: TemplatePlatform[] = [
  { id: 'twitch', name: 'Twitch', icon: '/brands/twitch.png', tags: ['{name}', '{game}', '{title}', '{viewers}', '{platform}'] },
  { id: 'kick', name: 'Kick', icon: '/brands/kick.png', tags: ['{name}', '{game}', '{title}', '{viewers}', '{platform}'] },
  { id: 'youtube', name: 'YouTube', icon: '/brands/youtube.png', tags: ['{name}', '{title}'] },
  { id: 'rss', name: 'RSS Feed', icon: '/brands/rss.png', tags: ['{name}', '{author}', '{title}', '{description}'] },
  { id: 'steam_news', name: 'Steam News', icon: '/brands/steam.png', tags: ['{name}', '{author}', '{title}'] },
  { id: 'epic_games', name: 'Epic Games', icon: '/brands/epic-games.png', tags: ['{name}', '{title}'] },
  { id: 'crypto', name: 'Crypto Alerts', icon: '/brands/crypto.png', tags: ['{name}', '{price}', '{threshold}', '{direction}', '{percent}'] },
  { id: 'steam_free', name: 'Steam Free', icon: '/brands/steam.png', tags: ['{name}', '{title}'] },
  { id: 'gog_free', name: 'GOG Free', icon: '/brands/gog.png', tags: ['{name}', '{title}'] },
  { id: 'movie', name: 'Movies', icon: '/brands/tmdb.png', tags: ['{name}', '{title}', '{rating}', '{year}'] },
  { id: 'tv_series', name: 'TV Series', icon: '/brands/tmdb.png', tags: ['{name}', '{title}', '{rating}', '{year}'] },
];

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
  '{author}': 'Author or creator name (RSS/Steam)',
  '{rating}': 'Movie or TV Show rating (e.g., 8.5)',
  '{year}': 'Release year of the content'
};

export const getTypeIconPath = (type: string): string => {
  return getPlatformLogo(type);
};

export const getAvailableVars = (platformId: string): string[] => {
  if (platformId === 'youtube') return ['name', 'title'];
  if (platformId === 'crypto') return ['name', 'price', 'percent', 'direction'];
  if (platformId === 'steam_news') return ['name', 'author', 'title'];
  if (platformId === 'github') return ['name', 'version'];
  if (platformId === 'movie' || platformId === 'tv_series') return ['name', 'title'];
  if (platformId === 'epic_games' || platformId === 'steam_free' || platformId === 'gog_free') return ['name', 'title'];
  if (platformId === 'rss') return ['name', 'title'];
  if (platformId === 'twitch' || platformId === 'stream') return ['name', 'game', 'title', 'viewers', 'platform'];
  if (platformId === 'kick') return ['name', 'game', 'title', 'viewers', 'platform'];
  return ['name'];
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
