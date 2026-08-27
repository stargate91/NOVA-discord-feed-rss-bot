export const home = {
  heroTag: 'Next-Generation Discord Notification Bot',
  heroTitle: 'Never miss an update',
  heroTitleWith: 'with',
  heroTitleHighlight: 'Nova',
  heroDescription:
    'Get instant notifications in your Discord server whenever your favorite creators go live, post new videos, or when games become 100% free. Fast, simple, and completely automatic.',
  ctaDiscord: 'Add to Discord',
  ctaDashboard: 'Open Dashboard',

  // Brand Chips / Supported Platforms
  supportedPlatformsTitle: 'Supported Platforms',
  supportedPlatformsSubtitle:
    'Connect all your favorite services and automate real-time alerts across your Discord server.',
  brandYoutube: 'YouTube',
  brandTwitch: 'Twitch',
  brandKick: 'Kick',
  brandEpic: 'Epic Games',
  brandSteam: 'Steam',
  brandGog: 'GOG Free',
  brandTmdb: 'TMDB Movies',
  brandGithub: 'GitHub Releases',
  brandRss: 'Custom RSS',

  // Live Preview
  previewTitle: 'Interactive Live Preview',
  previewSubtitle:
    'See exactly how Nova formats rich Discord notifications for each supported service.',
  platformYoutube: 'YouTube',
  platformTwitch: 'Twitch',
  platformKick: 'Kick',
  platformEpic: 'Epic Games',
  platformSteam: 'Steam Deals',
  platformTmdb: 'TMDB Movies',
  platformGithub: 'GitHub Releases',
  platformRss: 'Custom RSS',

  // Common Embed Labels & Feedback
  embedDeliveredBy: 'Delivered by',
  embedFieldPublishedAt: 'Published at',
  embedFieldGame: 'Game',
  embedFieldCategory: 'Category',
  embedFieldViewers: 'Viewers',
  embedFieldWorth: 'Worth',
  embedFieldType: 'Type',
  embedFieldExpiry: 'Offer Expiry',
  embedFieldScore: 'Score',
  embedFieldRuntime: 'Runtime',
  embedFieldGenres: 'Genres',
  embedFieldReleaseDate: 'Release Date',
  embedFieldTag: 'Release Tag',
  embedFieldCommit: 'Commit Hash',
  embedFieldAssets: 'Attached Assets',
  embedFieldSource: 'Feed Source',
  embedFieldReadTime: 'Read Time',

  // Embed Action Buttons
  embedBtnWatchYoutube: 'Watch on YouTube',
  embedBtnWatchStream: 'Watch Stream',
  embedBtnWatchKick: 'Watch on Kick',
  embedBtnGetGame: 'Get Game',
  embedBtnGetSteam: 'Get on Steam',
  embedBtnViewTmdb: 'View on TMDb',
  embedBtnWatchTrailer: 'Watch Trailer',
  embedBtnViewGithub: 'View on GitHub',
  embedBtnReadArticle: 'Read Full Article',

  // YouTube Demo Embed
  embedYoutubeRole: '@Hecklefish',
  embedYoutubeAlert: 'The Why Files just uploaded a new video!',
  embedYoutubeTitle:
    'The Basement: Mitch Horowitz | Gandhi, Reagan, and the Occultists History Erased',
  embedYoutubePublishedValue: 'Today at 18:03 (2 hours ago)',

  // Twitch Demo Embed
  embedTwitchRole: '@Stream Alerts',
  embedTwitchAlert: 'Shroud is now live streaming on Twitch!',
  embedTwitchTitle: 'Shroud • LIVE',
  embedTwitchDesc: 'Playing VALORANT • Ranked Games with the squad! Come join the stream.',
  embedTwitchGameValue: 'VALORANT',
  embedTwitchViewersValue: '24,510',

  // Kick Demo Embed
  embedKickRole: '@Kick Squad',
  embedKickAlert: 'Westcol is now live streaming on Kick!',
  embedKickTitle: 'Westcol • LIVE',
  embedKickDesc: '🔴 IRL & Just Chatting • 100K Viewer Special with the community! Come chill.',
  embedKickCategoryValue: 'Just Chatting',
  embedKickViewersValue: '48,290',

  // Epic Games Demo Embed
  embedEpicRole: '@Free Games',
  embedEpicAlert: 'New 100% Free Game on Epic Games Store!',
  embedEpicTitle: "Death Stranding Director's Cut",
  embedEpicWorthValue: '~~$39.99~~ FREE',
  embedEpicTypeValue: 'Full Game',
  embedEpicExpiryValue: 'Thursday at 17:00 UTC (in 4 days)',

  // Steam Demo Embed
  embedSteamRole: '@Steam Deals',
  embedSteamAlert: 'Limited-time 100% Free Giveaway on Steam!',
  embedSteamTitle: 'Warhammer: Vermintide 2',
  embedSteamWorthValue: '~~$29.99~~ FREE',
  embedSteamTypeValue: 'Steam Library Game',
  embedSteamExpiryValue: 'Sunday at 18:00 UTC',

  // TMDB Demo Embed
  embedTmdbRole: '@Cinema Club',
  embedTmdbAlert: 'New High-Rated Movie Digital Release!',
  embedTmdbTitle: 'Dune: Part Two',
  embedTmdbGenresValue: 'Sci-Fi, Adventure',
  embedTmdbScoreValue: '⭐ 8.6 / 10',
  embedTmdbReleaseValue: 'March 1, 2024',

  // GitHub Demo Embed
  embedGithubRole: '@Dev Releases',
  embedGithubAlert: 'New release published on GitHub!',
  embedGithubTitle: 'tiangolo/fastapi - Release 0.115.0',
  embedGithubDesc:
    'Support for Pydantic v2 recursive type validations, 40% faster JSON serialization pipeline, and async dependency injection optimizations.',
  embedGithubPublishedValue: 'Today at 12:45 (1 hour ago)',

  // RSS Demo Embed
  embedRssRole: '@Tech News',
  embedRssAlert: 'New article from RSS Feed!',
  embedRssTitle: 'Next-Gen AI Hardware Architecture Unveiled at Tech Summit',
  embedRssPublishedValue: '5 mins ago',

  // Feature Highlights
  scaleSpeedTitle: 'Engineered for Scale & Speed',
  scaleSpeedDesc:
    'Built on a high-concurrency asyncio architecture designed to handle thousands of servers with zero dropped alerts.',
  featureRealtimeTitle: 'Real-Time Polling',
  featureRealtimeSubtitle: 'Sub-minute synchronization',
  featureRealtimeDesc:
    'Dynamic shared caching and parallel scheduling guarantee your community never misses a stream start, game deal, or video upload.',

  featureReliabilityTitle: 'Enterprise Reliability',
  featureReliabilitySubtitle: 'Dead channel protection',
  featureReliabilityDesc:
    'Zero message drop tolerance. If a channel lacks permissions or is deleted, Nova isolates the error without disrupting your entire feed schedule.',

  featureLayoutsTitle: 'Fully Customizable Layouts',
  featureLayoutsSubtitle: 'Tailored to each platform',
  featureLayoutsDesc:
    'Rich custom Discord embeds with high-resolution thumbnails, author avatars, score ratings, and custom ping roles for your members.',

  // Stats & Performance
  statLatencyTitle: 'Average Delivery Latency',
  statLatencyValue: '0.84s',
  statLatencyLabel: 'Real-time WebSockets',
  statLatencyProgress: '92% sub-second',
  statPollingTitle: 'API Polling Efficiency',
  statPollingValue: '99.98%',
  statPollingLabel: 'Uptime SLA Target',
  statPollingProgress: '99.98% uptime',
  statQuotaTitle: 'Quota Utilization',
  statQuotaValue: 'Optimal',
  statQuotaLabel: 'Distributed Adaptive Cache',
  statQuotaProgress: '42% headroom',

  // FAQ
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle:
    'Everything you need to know about setting up and operating Nova Feeds in your server.',
  faq1Question: 'How fast does Nova notify my Discord server when a video or stream goes live?',
  faq1Answer:
    'For Twitch and Kick, Nova leverages persistent low-latency WebSockets delivering Discord alerts within 1 to 3 seconds of a broadcast starting. YouTube and RSS feeds are polled continuously in sub-60 second cycles.',
  faq2Question: 'What bot permissions does Nova require?',
  faq2Answer:
    'Nova only requests standard channel permissions: Send Messages, Embed Links, and Attach Files in the destination channels you select. We never ask for Administrator privileges.',
  faq3Question: 'Can I customize the Discord embed layout and role mentions?',
  faq3Answer:
    'Yes! Every feed monitor can be configured with custom @role snowflake pings, custom embed colors, banner layouts, thumbnail styles, and localized timestamps.',
  faq4Question: 'What happens if a destination channel is deleted or permissions are revoked?',
  faq4Answer:
    "Nova includes dead channel isolation. If a Discord channel becomes unavailable, Nova marks the feed as paused and records an audit log without blocking your server's other active monitors.",

  // CTA Superpower
  ctaSuperpowerTitle: 'Ready to superpower your Discord server?',
  ctaSuperpowerDesc:
    'Add Nova Feeds today and keep your community engaged with sub-second live notifications.',
} as const;
