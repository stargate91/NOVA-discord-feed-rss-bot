/**
 * Centralized Backend Source Resolution and URL Normalization Module
 * Single Source of Truth (SSoT) for resolving canonical names, IDs, and API URLs
 * across YouTube, Twitch, Kick, GitHub, Steam, RSS, Crypto, and others.
 */

export interface ResolvedSource {
  type: string;
  canonicalId: string;
  name: string;
  apiUrl: string;
  suggestedName?: string;
  extra?: Record<string, any>;
}

export function detectPlatformFromRawInput(rawInput: string): { type: string; cleanedInput: string } | null {
  const input = (rawInput || '').trim();
  if (!input) return null;

  // 1. YouTube
  if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
    const channelMatch = input.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
    if (channelMatch) return { type: 'youtube', cleanedInput: channelMatch[1] };

    const handleMatch = input.match(/\/@([a-zA-Z0-9_.-]+)/i);
    if (handleMatch) return { type: 'youtube', cleanedInput: `@${handleMatch[1]}` };

    const customMatch = input.match(/\/c\/([a-zA-Z0-9_.-]+)/i);
    if (customMatch) return { type: 'youtube', cleanedInput: customMatch[1] };

    return { type: 'youtube', cleanedInput: input };
  }
  if (input.startsWith('UC') && input.length === 24) {
    return { type: 'youtube', cleanedInput: input };
  }

  // 2. Twitch / Stream
  if (input.includes('twitch.tv/')) {
    const twitchMatch = input.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
    if (twitchMatch) return { type: 'stream', cleanedInput: twitchMatch[1].toLowerCase() };
  }

  // 3. Kick
  if (input.includes('kick.com/')) {
    const kickMatch = input.match(/kick\.com\/([a-zA-Z0-9_]+)/i);
    if (kickMatch) return { type: 'kick', cleanedInput: kickMatch[1].toLowerCase() };
  }

  // 4. Steam News
  if (input.includes('store.steampowered.com/app/')) {
    const steamMatch = input.match(/\/app\/(\d+)/i);
    if (steamMatch) return { type: 'steam_news', cleanedInput: steamMatch[1] };
  }

  // 5. GitHub
  if (input.includes('github.com/')) {
    const ghMatch = input.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (ghMatch) return { type: 'github', cleanedInput: `${ghMatch[1]}/${ghMatch[2]}` };
  }

  // 6. RSS / Atom
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return { type: 'rss', cleanedInput: input };
  }

  return null;
}

export function resolveSource(rawInput: string, platformType?: string): ResolvedSource {
  const input = (rawInput || '').trim();
  const detected = detectPlatformFromRawInput(input);
  const type = platformType || detected?.type || 'youtube';

  let canonicalId = input;
  let name = input;
  let apiUrl = input;
  let suggestedName: string | undefined = undefined;
  const extra: Record<string, any> = {};

  switch (type) {
    case 'youtube': {
      if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
        const channelMatch = input.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
        const handleMatch = input.match(/\/@([a-zA-Z0-9_.-]+)/i);
        const customMatch = input.match(/\/c\/([a-zA-Z0-9_.-]+)/i);
        const userMatch = input.match(/\/user\/([a-zA-Z0-9_.-]+)/i);

        if (channelMatch) {
          canonicalId = channelMatch[1];
          name = channelMatch[1];
        } else if (handleMatch) {
          canonicalId = `@${handleMatch[1]}`;
          name = handleMatch[1];
        } else if (customMatch) {
          canonicalId = customMatch[1];
          name = customMatch[1];
        } else if (userMatch) {
          canonicalId = userMatch[1];
          name = userMatch[1];
        } else {
          // Extract last segment
          const segments = input.split('?')[0].split('/').filter(Boolean);
          const last = segments[segments.length - 1] || input;
          canonicalId = last.replace('@', '');
          name = canonicalId;
        }
      } else if (input.startsWith('@')) {
        canonicalId = input;
        name = input.replace('@', '');
      } else {
        canonicalId = input;
        name = input.replace('@', '');
      }

      apiUrl = canonicalId.startsWith('UC')
        ? `https://www.youtube.com/channel/${canonicalId}`
        : `https://www.youtube.com/@${name}`;
      extra.channel_id = canonicalId;
      break;
    }

    case 'stream':
    case 'twitch': {
      let username = input;
      if (input.includes('twitch.tv/')) {
        const match = input.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
        if (match) username = match[1];
      }
      username = username.replace(/^@/, '').toLowerCase();
      canonicalId = username;
      name = username;
      suggestedName = username;
      apiUrl = `https://www.twitch.tv/${username}`;
      break;
    }

    case 'kick': {
      let username = input;
      if (input.includes('kick.com/')) {
        const match = input.match(/kick\.com\/([a-zA-Z0-9_]+)/i);
        if (match) username = match[1];
      }
      username = username.replace(/^@/, '').toLowerCase();
      canonicalId = username;
      name = username;
      suggestedName = username;
      apiUrl = `https://kick.com/${username}`;
      break;
    }

    case 'github': {
      let repo = input;
      if (input.includes('github.com/')) {
        const match = input.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
        if (match) repo = `${match[1]}/${match[2]}`;
      }
      canonicalId = repo;
      name = repo;
      const parts = repo.split('/');
      if (parts.length === 2) suggestedName = parts[1];
      apiUrl = `https://github.com/${repo}`;
      break;
    }

    case 'steam_news': {
      let appId = input;
      if (input.includes('store.steampowered.com/app/')) {
        const match = input.match(/\/app\/(\d+)(?:\/([a-zA-Z0-9_ -]+))?/i);
        if (match) {
          appId = match[1];
          if (match[2]) suggestedName = decodeURIComponent(match[2].replace(/_/g, ' '));
        }
      }
      canonicalId = appId;
      name = suggestedName || `Steam App ${appId}`;
      apiUrl = `https://store.steampowered.com/app/${appId}`;
      break;
    }

    case 'rss': {
      canonicalId = input;
      name = input;
      apiUrl = input;
      break;
    }

    case 'crypto': {
      canonicalId = input.toUpperCase().replace(/\s+/g, '');
      name = canonicalId;
      apiUrl = canonicalId;
      break;
    }

    default: {
      canonicalId = input;
      name = input;
      apiUrl = input;
    }
  }

  return {
    type,
    canonicalId,
    name,
    apiUrl,
    suggestedName,
    extra,
  };
}
