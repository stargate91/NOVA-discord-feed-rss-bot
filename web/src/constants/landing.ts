export interface LandingFeature {
  title: string;
  desc: string;
  iconName: 'Zap' | 'Play' | 'Rss' | 'Activity' | 'Layout' | 'Shield';
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    iconName: 'Zap',
    title: 'Free Game Drops',
    desc: 'Epic Games, Steam, and GOG free-to-keep promotions sent the minute they go live.',
  },
  {
    iconName: 'Play',
    title: 'YouTube & Twitch',
    desc: 'Instant notifications for new video uploads, premieres, and live stream broadcasts.',
  },
  {
    iconName: 'Rss',
    title: 'Universal RSS Feeds',
    desc: 'Track any news site, blog, podcast, or game patch notes with sub-minute accuracy.',
  },
  {
    iconName: 'Activity',
    title: 'Crypto & Markets',
    desc: 'Real-time price threshold alerts and market movements directly in your channels.',
  },
  {
    iconName: 'Layout',
    title: 'Web Dashboard V2',
    desc: 'Ultra-fast, responsive dashboard for total control over server alerts and roles.',
  },
  {
    iconName: 'Shield',
    title: 'Custom Branding',
    desc: 'White-label feeds with custom bot avatar, server branding, and color palettes.',
  },
];
