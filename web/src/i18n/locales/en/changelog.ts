export const changelog = {
  title: 'Product',
  titleHighlight: 'Changelog',
  subtitle:
    'Stay updated with the latest features, platform monitors, architectural enhancements, and bug fixes for Nova.',

  v100Title: 'Nova v1.0.0 — Enterprise Architecture & Web Dashboard',
  v100Subtitle: 'Released August 2026',
  v100Badge: 'Latest',
  v100Desc:
    'The definitive enterprise release of Nova is here! Complete redesign featuring decoupled async microservice architecture and high-performance Web management SPA.',
  v100Feature1:
    'Modern SPA Web Portal: Manage Discord feeds, check backend health telemetry, and configure promo codes from your browser.',
  v100Feature2:
    'Distributed Queue Worker: In-memory and Redis-backed notification queue with zero message drop guarantees.',
  v100Feature3:
    'Dead Channel Isolation: Automatic error recovery preventing dead or misconfigured channels from delaying active feeds.',
  v100Feature4:
    'Kick Streaming Support: Native livestream detection and category tracking for Kick.com creators.',

  v090Title: 'Nova v0.9.0 — Multi-Language & Free Games Monitors',
  v090Subtitle: 'Released July 2026',
  v090Badge: 'Archived',
  v090Feature1:
    '17 Locales Supported: Full internationalization for Discord notifications and admin command feedback.',
  v090Feature2:
    'Epic Games, Steam & GOG Free Deals: Automated tracking of 100% discount game giveaways.',
  v090Feature3:
    'Adaptive Shared Polling: Grouped requests reducing external API rate limits by over 60%.',
} as const;
