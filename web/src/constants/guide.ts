export interface GuideTip {
  text: string;
  premium: boolean;
}

export interface GuideStepTemplate {
  id: number;
  title: string;
  description: string;
  iconName: 'Settings' | 'PlusCircle' | 'Bell' | 'Layout';
  pathSuffix: string;
  linkText: string;
  tips: GuideTip[];
}

export const GUIDE_STEPS: GuideStepTemplate[] = [
  {
    id: 1,
    title: 'Configure Server Settings',
    description: "Set your server's language, polling speed, and management roles. This ensures the bot speaks your language and staff have access.",
    iconName: 'Settings',
    pathSuffix: 'settings',
    linkText: 'Configure Settings',
    tips: [
      { text: 'Choose your primary language from 17 supported options', premium: false },
      { text: 'Set an Admin Role so your moderation team can edit monitors', premium: false },
      { text: 'Unlock fast 2-minute polling intervals with premium', premium: true },
    ],
  },
  {
    id: 2,
    title: 'Create Feed Monitors',
    description: "Nova supports YouTube, Twitch, Kick, Steam, RSS, Crypto and Free Games. Just paste a link or handle and we'll handle the rest.",
    iconName: 'PlusCircle',
    pathSuffix: 'monitors',
    linkText: 'Open Monitors',
    tips: [
      { text: 'Add any YouTube channel, Twitch streamer, or RSS feed URL', premium: false },
      { text: 'Select target Discord channels and ping roles for each feed', premium: false },
      { text: 'Bulk add wizard available for batch importing monitors', premium: false },
    ],
  },
  {
    id: 3,
    title: 'Design Custom Alert Embeds',
    description: 'Personalize notification layouts. Customize embed colors, markdown content, and automated mention tags.',
    iconName: 'Bell',
    pathSuffix: 'settings',
    linkText: 'Edit Templates',
    tips: [
      { text: 'Use built-in high fidelity Cyberpunk embed templates', premium: false },
      { text: 'Custom template variables: {title}, {url}, {author}', premium: true },
      { text: 'Remove bot footer branding for a native server look', premium: true },
    ],
  },
  {
    id: 4,
    title: 'Track Performance & Logs',
    description: 'Analyze delivery throughput, peak activity hours, and system health status in real time.',
    iconName: 'Layout',
    pathSuffix: 'analytics',
    linkText: 'View Analytics',
    tips: [
      { text: 'Check delivery statistics in the Analytics dashboard', premium: false },
      { text: "Ensure the bot has 'Send Messages' and 'Embed Links' permissions", premium: false },
      { text: 'Use diagnostics drawer in monitors for manual force checking', premium: false },
    ],
  },
];
