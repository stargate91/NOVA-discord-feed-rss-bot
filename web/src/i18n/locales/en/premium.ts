export const premium = {
  title: 'Supercharge Your',
  titleHighlight: 'Community Feeds',
  subtitle:
    'Accelerated polling speeds, higher monitor quotas, priority queue delivery, and full platform access.',

  // Billing Toggle
  billingMonthly: 'Monthly Billing',
  billingYearly: 'Yearly Billing',
  billingYearlyDiscount: 'Save up to 17%',
  perMonth: '/ month',
  perYear: '/ year',

  // 1. Nova Free ($0 / $0)
  freeTitle: 'Nova Free',
  freePriceMonthly: '$0',
  freePriceYearly: '$0',
  freeDesc: 'Essential social alerts for small community servers.',
  freeFeature1: '5 Active Feed Monitors',
  freeFeature2: '20-minute Polling Intervals',
  freeFeature3: '1 Destination Channel & Ping Role',
  freeFeature4: 'YouTube, Twitch, Kick & RSS Feeds',
  freeCta: 'Get Started Free',

  // 2. Nova Starter ($4.99 / $49.00)
  starterTitle: 'Nova Starter',
  starterPriceMonthly: '$4.99',
  starterPriceYearly: '$49.00',
  starterDesc: 'Enhanced speed and capacity for growing communities.',
  starterFeature1: '15 Active Feed Monitors (3x)',
  starterFeature2: '10-minute Polling Intervals (2x speed)',
  starterFeature3: '5 Destination Channels & Mention Roles',
  starterFeature4: 'Free Games (Steam, Epic, GOG) & TMDB Media',
  starterFeature5: 'Custom Hex Colors & Remove Branding',
  starterCta: 'Choose Starter',

  // 3. Nova Professional ($9.99 / $99.00)
  professionalTitle: 'Nova Professional',
  professionalBadge: 'Most Popular',
  professionalPriceMonthly: '$9.99',
  professionalPriceYearly: '$99.00',
  professionalDesc: 'High-speed delivery and advanced alert formatting.',
  professionalFeature1: '35 Active Feed Monitors',
  professionalFeature2: '5-minute Rapid Polling Speed',
  professionalFeature3: '10 Destination Channels & Mention Roles',
  professionalFeature4: 'Custom Alert Templates & Repost Support',
  professionalFeature5: 'High-Priority Delivery Queue',
  professionalCta: 'Choose Professional',

  // 4. Nova Ultimate ($14.99 / $199.00)
  ultimateTitle: 'Nova Ultimate',
  ultimateBadge: 'Maximum Power',
  ultimatePriceMonthly: '$14.99',
  ultimatePriceYearly: '$199.00',
  ultimateDesc: 'Turbocharged performance for major creator networks.',
  ultimateFeature1: '100 Active Feed Monitors',
  ultimateFeature2: '1-minute Turbo Polling (Fastest)',
  ultimateFeature3: '20 Destination Channels & Mention Roles',
  ultimateFeature4: 'Crypto & Financial Price Alerts',
  ultimateFeature5: 'Raw CSV Export & Direct Dev Support',
  ultimateCta: 'Choose Ultimate',

  // Master Tier (Internal / Reference Only)
  masterTitle: 'Nova Master',
  masterBadge: 'Owner Designated',
  masterPriceMonthly: '∞',
  masterPriceYearly: '∞',
  masterPricePeriod: 'Unlimited',
  masterDesc: 'Exclusive tier with zero limits, managed directly by the bot owner.',
  masterFeature1: 'Unlimited Feed Monitors (No limits)',
  masterFeature2: 'Instantaneous Realtime Polling (0s)',
  masterFeature3: 'All Existing & Future Feed Modules',
  masterFeature4: 'Full Custom Embeds & Zero Limits',
  masterFeature5: 'Direct Developer Support',
  masterCta: 'Owner Assigned Only',
  masterNotBuyableNote: 'Non-purchasable tier — designated by bot owner only',

  // Comparison Table
  tableTitle: 'Compare Plans & Features',
  tableSubtitle: 'Complete side-by-side breakdown of resource limits, integrations, and customization options.',
  tableColumnFeature: 'Feature',
  tableCatQuotas: 'Resource Limits & Capacity',
  tableCatPlatforms: 'Platform Integrations',
  tableCatCustomization: 'Styling & Customization',
  tableCatAdvanced: 'Advanced Controls & Management',
  tableCatDelivery: 'Speed, Delivery & Support',

  // Comparison Rows
  rowMaxMonitors: 'Active Feed Monitors',
  rowRefreshInterval: 'Polling / Update Frequency',
  rowMaxChannels: 'Destination Channels / Feed',
  rowMaxPings: 'Role Mention / Ping Slots',
  rowMaxPurge: 'Message Purge / Bulk Cleanup',

  rowPlatformStandard: 'YouTube, Twitch, Kick & RSS',
  rowPlatformGames: 'Free Games (Steam, Epic, GOG)',
  rowPlatformMovies: 'TMDB Movies & TV Series',
  rowPlatformCrypto: 'Crypto & Financial Alerts',
  rowPlatformSteamNews: 'Steam News & Patch Notes',

  rowCustomColor: 'Custom Hex Embed Colors',
  rowAlertTemplate: 'Preset Alert Templates',
  rowCustomTemplate: 'Dynamic Custom Templates',
  rowGenreFilter: 'Genre & Language Multi-Filters',
  rowRemoveBranding: 'Remove Bot Branding Footer',

  rowRepost: 'Repost & Re-broadcast Feeds',
  rowBulkDelete: 'Bulk Monitor Management',
  rowCsvExport: 'Raw CSV Data Export & Logs',
  rowPriorityDelivery: 'Delivery Queue Priority',
  rowSupport: 'Support Level',

  // Comparison Values
  val20Min: '20 min',
  val10Min: '10 min',
  val5Min: '5 min',
  val1Min: '1 min',
  valStandardQueue: 'Standard',
  valPriorityQueue: 'High Priority',
  valCommunitySupport: 'Community',
  valPrioritySupport: 'Priority Discord',
  valVipSupport: 'Direct Dev Support',

  // FAQ
  faqTitle: 'Frequently Asked Questions',
  faqQ1: 'How do subscription tiers apply to Discord servers?',
  faqA1:
    'Subscriptions are tied to your Discord server (Guild ID). Once upgraded, all administrators and members on that guild instantly benefit from the expanded limits and accelerated intervals.',
  faqQ2: 'Can I cancel or switch tiers anytime?',
  faqA2:
    'Yes! You can upgrade, downgrade, or cancel your subscription at any point from your server management dashboard. Your plan remains active until the end of your billing cycle.',
} as const;
