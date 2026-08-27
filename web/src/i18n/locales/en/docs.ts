export const docs = {
  tag: 'Documentation & Reference',
  title: 'Getting Started with',
  titleHighlight: 'Nova Feeds',
  subtitle:
    'Learn how to invite the bot, configure social monitors, customize notification layouts, and manage guild entitlements.',

  tabSetup: 'Setup & Permissions',
  tabFeeds: 'Supported Feeds',
  tabCommands: 'Slash Commands',

  section1Title: '1. Bot Invitation & Permissions',
  section1Desc:
    'To invite Nova to your Discord server, you must have the Manage Server or Administrator permission on that server.',
  tableHeadPermission: 'Required Discord Permission',
  tableHeadPurpose: 'Purpose',
  tableHeadStatus: 'Status',
  badgeRequired: 'Required',
  badgeOptional: 'Optional',
  permSend: 'Send Messages & Embed Links: Required for delivering rich media cards.',
  permSendDesc: 'Dispatching feed notifications to selected channels',
  permAttach: 'Attach Files: Required for high-resolution posters and thumbnails.',
  permAttachDesc: 'Uploading thumbnails, banners, and preview posters',
  permMention:
    'Mention Roles: Optional, required if you configure custom ping roles on notifications.',
  permMentionDesc: 'Triggering customized notification pings for subscribed roles',

  section2Title: '2. Supported Monitor Types',
  section2Desc: 'Nova features dedicated, optimized monitors for all major creators and platforms:',
  typeYoutube: 'YouTube: Tracks channel video uploads and Premieres.',
  typeStream: 'Twitch & Kick: Real-time stream start detection and game category updates.',
  typeGames: 'Epic Games, Steam & GOG: 100% free limited-time game giveaways.',
  typeTmdb: 'TMDB Movies: Popular movie releases, score ratings, and overview summaries.',
  typeRss: 'RSS / Atom Feeds: Standard XML feeds for news portals, blogs, and custom endpoints.',
  chipKick: 'Kick WebSockets',
  chipEpic: 'Epic Store Deals',
  chipGithub: 'GitHub Releases',

  section3Title: '3. Slash Command Reference',
  section3Desc:
    'Execute these commands directly inside your Discord server or manage feeds in the dashboard.',
  tableHeadCommand: 'Command',
  tableHeadDescription: 'Description',
  cmdAdd: '/feed add [type] [target] [channel] — Create a new automated monitor.',
  cmdAddDesc: 'Creates a new monitor for YouTube, Twitch, Kick, Steam, or RSS feeds',
  cmdList: '/feed list — List all active monitors on your server.',
  cmdListDesc: 'Lists all active notification monitors configured for this server',
  cmdTest: '/feed test [id] — Trigger an immediate test message in your destination channel.',
  cmdTestDesc:
    'Dispatches a synthetic live preview notification to verify permissions and embed layout',
  cmdRemove: '/feed remove [id] — Delete an active monitor.',
  cmdRemoveDesc: 'Safely deletes a feed monitor and clears related cache entries',
  cmdStatus: '/feed status — Display polling latency and health metrics for your guild.',
  cmdStatusDesc: 'Displays real-time bot worker health, shard latency, and channel permissions',
} as const;
