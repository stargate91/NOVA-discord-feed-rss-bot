/**
 * Platform Detection and URL Normalization Utility
 * Extracts target IDs, handles, and clean inputs from user provided URLs.
 */

export interface DetectedPlatform {
  type: string;
  cleanedInput: string;
  suggestedName?: string;
  confidence: 'high' | 'medium' | 'low';
}

export function detectPlatformFromInput(rawInput: string): DetectedPlatform | null {
  const input = rawInput.trim();
  if (!input) return null;

  // 1. YouTube
  if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
    const channelMatch = input.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/i);
    if (channelMatch) {
      return { type: 'youtube', cleanedInput: channelMatch[1], confidence: 'high' };
    }
    const handleMatch = input.match(/\/@([a-zA-Z0-9_.-]+)/i);
    if (handleMatch) {
      return { type: 'youtube', cleanedInput: `@${handleMatch[1]}`, confidence: 'high' };
    }
    return { type: 'youtube', cleanedInput: input, confidence: 'medium' };
  }
  if (input.startsWith('UC') && input.length === 24) {
    return { type: 'youtube', cleanedInput: input, confidence: 'high' };
  }

  // 2. Twitch
  if (input.includes('twitch.tv/')) {
    const twitchMatch = input.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
    if (twitchMatch) {
      const username = twitchMatch[1].toLowerCase();
      return { type: 'twitch', cleanedInput: username, suggestedName: twitchMatch[1], confidence: 'high' };
    }
  }

  // 3. Steam News
  if (input.includes('store.steampowered.com/app/')) {
    const steamMatch = input.match(/\/app\/(\d+)(?:\/([a-zA-Z0-9_ -]+))?/i);
    if (steamMatch) {
      const appId = steamMatch[1];
      const gameName = steamMatch[2] ? decodeURIComponent(steamMatch[2].replace(/_/g, ' ')) : undefined;
      return { type: 'steam_news', cleanedInput: appId, suggestedName: gameName, confidence: 'high' };
    }
  }

  // 4. GitHub Releases / Commits
  if (input.includes('github.com/')) {
    const ghMatch = input.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (ghMatch) {
      const repo = `${ghMatch[1]}/${ghMatch[2]}`;
      return { type: 'github', cleanedInput: repo, suggestedName: ghMatch[2], confidence: 'high' };
    }
  }

  // 5. Kick
  if (input.includes('kick.com/')) {
    const kickMatch = input.match(/kick\.com\/([a-zA-Z0-9_]+)/i);
    if (kickMatch) {
      return { type: 'kick', cleanedInput: kickMatch[1].toLowerCase(), suggestedName: kickMatch[1], confidence: 'high' };
    }
  }

  // 6. TikTok
  if (input.includes('tiktok.com/')) {
    const ttMatch = input.match(/@([a-zA-Z0-9_.-]+)/i);
    if (ttMatch) {
      return { type: 'tiktok', cleanedInput: ttMatch[1], confidence: 'high' };
    }
  }

  // 7. RSS / Atom feed URLs
  if (input.startsWith('http://') || input.startsWith('https://')) {
    if (input.endsWith('.rss') || input.endsWith('.xml') || input.includes('/feed') || input.includes('/rss')) {
      return { type: 'rss', cleanedInput: input, confidence: 'high' };
    }
    return { type: 'rss', cleanedInput: input, confidence: 'medium' };
  }

  return null;
}

/**
 * Format helper for Discord role colors
 */
export function formatDiscordRoleColor(colorInt: number): string {
  if (!colorInt || colorInt === 0) return '#99aab5';
  return `#${colorInt.toString(16).padStart(6, '0')}`;
}
