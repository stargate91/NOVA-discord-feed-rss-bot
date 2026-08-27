export const home = {
  heroTag: 'Next-Generation Discord Notification Bot',
  heroTitle: 'Automate Everything with',
  heroTitleHighlight: 'Nova Feeds',
  heroDescription: 'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.',
  ctaDiscord: 'Add to Discord',
  ctaDashboard: 'Open Dashboard',

  // Brand Chips
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
  previewSubtitle: 'See exactly how Nova formats rich Discord notifications for each supported service.',
  platformYoutube: 'YouTube',
  platformTwitch: 'Twitch',
  platformSteam: 'Steam Deals',
  platformGithub: 'GitHub Releases',

  // Live Embed Demo
  embedChannelName: 'feed-alerts',
  embedBotName: 'Nova',
  embedTimestamp: 'Today at 14:32',
  embedTitle: 'Shroud is now LIVE on Twitch!',
  embedDescription: 'Playing **VALORANT** • Ranked Games with the squad! Come join the stream.',
  embedFooter: 'Twitch Monitor • Nova feeds',

  // Feature Highlights
  scaleSpeedTitle: 'Engineered for Scale & Speed',
  scaleSpeedDesc: 'Built on a high-concurrency asyncio architecture designed to handle thousands of servers with zero dropped alerts.',
  featureRealtimeTitle: 'Real-Time Polling',
  featureRealtimeSubtitle: 'Sub-minute synchronization',
  featureRealtimeDesc: 'Dynamic shared caching and parallel scheduling guarantee your community never misses a stream start, game deal, or video upload.',

  featureReliabilityTitle: 'Enterprise Reliability',
  featureReliabilitySubtitle: 'Dead channel protection',
  featureReliabilityDesc: 'Zero message drop tolerance. If a channel lacks permissions or is deleted, Nova isolates the error without disrupting your entire feed schedule.',

  featureLayoutsTitle: 'Fully Customizable Layouts',
  featureLayoutsSubtitle: 'Tailored to each platform',
  featureLayoutsDesc: 'Rich custom Discord embeds with high-resolution thumbnails, author avatars, score ratings, and custom ping roles for your members.',

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
  faqSubtitle: 'Everything you need to know about setting up and operating Nova Feeds in your server.',
  faq1Question: 'How fast does Nova notify my Discord server when a video or stream goes live?',
  faq1Answer: 'For Twitch and Kick, Nova leverages persistent low-latency WebSockets delivering Discord alerts within 1 to 3 seconds of a broadcast starting. YouTube and RSS feeds are polled continuously in sub-60 second cycles.',
  faq2Question: 'What bot permissions does Nova require?',
  faq2Answer: 'Nova only requests standard channel permissions: Send Messages, Embed Links, and Attach Files in the destination channels you select. We never ask for Administrator privileges.',
  faq3Question: 'Can I customize the Discord embed layout and role mentions?',
  faq3Answer: 'Yes! Every feed monitor can be configured with custom @role snowflake pings, custom embed colors, banner layouts, thumbnail styles, and localized timestamps.',
  faq4Question: 'What happens if a destination channel is deleted or permissions are revoked?',
  faq4Answer: "Nova includes dead channel isolation. If a Discord channel becomes unavailable, Nova marks the feed as paused and records an audit log without blocking your server's other active monitors.",

  // CTA Superpower
  ctaSuperpowerTitle: 'Ready to superpower your Discord server?',
  ctaSuperpowerDesc: 'Add Nova Feeds today and keep your community engaged with sub-second live notifications.',
} as const;

