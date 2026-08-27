export const docs = {
  tag: 'Documentation & Reference',
  title: 'Getting Started with',
  titleHighlight: 'Nova Feeds',
  subtitle: 'Learn how to invite the bot, configure social monitors, customize notification layouts, and manage guild entitlements.',

  section1Title: '1. Bot Invitation & Permissions',
  section1Desc: 'To invite Nova to your Discord server, you must have the Manage Server or Administrator permission on that server.',
  permSend: 'Send Messages & Embed Links: Required for delivering rich media cards.',
  permAttach: 'Attach Files: Required for high-resolution posters and thumbnails.',
  permMention: 'Mention Roles: Optional, required if you configure custom ping roles on notifications.',

  section2Title: '2. Supported Monitor Types',
  section2Desc: 'Nova features dedicated, optimized monitors for all major creators and platforms:',
  typeYoutube: 'YouTube: Tracks channel video uploads and Premieres.',
  typeStream: 'Twitch & Kick: Real-time stream start detection and game category updates.',
  typeGames: 'Epic Games, Steam & GOG: 100% free limited-time game giveaways.',
  typeTmdb: 'TMDB Movies: Popular movie releases, score ratings, and overview summaries.',
  typeRss: 'RSS / Atom Feeds: Standard XML feeds for news portals, blogs, and custom endpoints.',

  section3Title: '3. Slash Command Reference',
  cmdAdd: '/feed add [type] [target] [channel] — Create a new automated monitor.',
  cmdList: '/feed list — List all active monitors on your server.',
  cmdTest: '/feed test [id] — Trigger an immediate test message in your destination channel.',
  cmdRemove: '/feed remove [id] — Delete an active monitor.',
  cmdStatus: '/feed status — Display polling latency and health metrics for your guild.',
} as const;
