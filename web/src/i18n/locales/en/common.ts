export const common = {
  brandName: 'Nova Feeds',
  statusOnline: 'Online',
  statusOffline: 'Offline',
  checking: 'Checking...',
  backendOnline: 'Backend Online',
  backendOffline: 'Backend Offline',
  dashboard: 'Dashboard',
  save: 'Save Changes',
  saved: 'Saved successfully',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  never: 'Never',
  searchPlaceholder: 'Search...',
  manage: 'Manage',
  upgrade: 'Upgrade',
  version: 'Version 1.0.0',
  copyright: '© 2026 Nova Feeds. All rights reserved.',

  // Global Navigation
  navOverview: 'Overview',
  navPremium: 'Premium',
  navDocs: 'Docs',
  navSupport: 'Support & FAQ',
  navChangelog: 'Changelog',
  navDev: 'Dev',
  navServers: 'Select Server',
  navSwitchServer: 'Switch Server',
  navPublicWebsite: 'Public Website',
  navFeeds: 'Feeds & Monitors',
  navAnalytics: 'Analytics & Stats',
  navGuildSettings: 'Guild Settings',

  // Error Boundary
  errorBoundaryTitle: 'Something went wrong',
  errorBoundarySubtitle: 'An unexpected client error occurred in the {name} component.',
  errorBoundaryDetails: 'Diagnostic Information',
  errorBoundaryTryAgain: 'Try Again',
  errorBoundaryReload: 'Reload Application',

  // Feature Gate & Upgrade Promo
  tierRequired: '{tier} Required',
  unlockFeature: 'Unlock {feature}',
  upgradePromoDefaultDesc:
    'This advanced functionality is exclusively available on the {tier} and above. Upgrade your Discord server to activate immediate access.',
  upgradeServerBtn: 'Upgrade Server',
  defaultFeatureName: 'This feature',

  // Offline Banner
  offlineLost:
    'Network connection lost. Offline changes will be synced once connection is restored.',
  offlineRestored: 'Connection restored! Telemetry synchronization active.',

  // Header & Footer
  serverWithId: 'Server #{id}',
  plusTier: 'Plus Tier',
  footerResources: 'Resources',
  footerLegalSupport: 'Legal & Support',

  // 404 Not Found
  notFoundTitle: '404 — Page Not Found',
  notFoundHeadline: 'Lost in Deep Space?',
  notFoundDesc:
    'The interstellar coordinates you requested do not exist or have been relocated to another sector.',
  notFoundBackHome: 'Return to Home',
  notFoundGoServers: 'Select Server',
  notFoundContactSupport: 'Support Center',

  // Accessibility
  skipToContent: 'Skip to content',

  // Theme Switching
  themeToggle: 'Switch Theme',
  themeDark: 'Dark Mode',
  themeLight: 'Light Mode',

  // Auth Callback
  authCallbackTitle: 'Authenticating...',
  authCallbackVerifying: 'Securely verifying your Discord session...',
  authCallbackFailed: 'Authentication Failed',
  authCallbackReturnHome: 'Return Home',
} as const;
