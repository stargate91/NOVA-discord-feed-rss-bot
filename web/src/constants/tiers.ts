export interface TierFeature {
  text: string;
  disabled?: boolean;
  highlight?: boolean;
}

export interface TierItem {
  tier: number;
  title: string;
  description: string;
  price: { mo: string; yr: string };
  isPopular?: boolean;
  features: TierFeature[];
}

export interface TierLimits {
  maxMonitors: number;
  minRefreshInterval: number;
  maxPurge: number;
  maxChannels: number;
  maxPings: number;
  maxAnalyticsDays: number;
}

export interface TierDefinition {
  tier: number;
  id: 'free' | 'starter' | 'professional' | 'ultimate';
  title: string;
  name: string;
  description: string;
  price: { mo: string; yr: string };
  isPopular?: boolean;
  limits: TierLimits;
  canCustomColor: boolean;
  canAlertTemplate: boolean;
  canCustomTemplate: boolean;
  canGenreFilter: boolean;
  canTmdbLanguageFilter: boolean;
  canRemoveBranding: boolean;
  canBulkImport: boolean;
  canBulkDelete: boolean;
  canRepost: boolean;
  hasNativePlayer: boolean;
  hasDiagnosticSuite: boolean;
  hasPrioritySupport: boolean;
  hasExportData: boolean;
  features: TierFeature[];
}

export const TIER_DEFINITIONS: Record<number, TierDefinition> = {
  0: {
    tier: 0,
    id: 'free',
    title: 'Free',
    name: 'Free',
    description: 'For small hobby projects',
    price: { mo: '0', yr: '0' },
    limits: {
      maxMonitors: 2,
      minRefreshInterval: 20,
      maxPurge: 10,
      maxChannels: 1,
      maxPings: 1,
      maxAnalyticsDays: 3,
    },
    canCustomColor: false,
    canAlertTemplate: false,
    canCustomTemplate: false,
    canGenreFilter: false,
    canTmdbLanguageFilter: false,
    canRemoveBranding: false,
    canBulkImport: false,
    canBulkDelete: false,
    canRepost: false,
    hasNativePlayer: false,
    hasDiagnosticSuite: false,
    hasPrioritySupport: false,
    hasExportData: false,
    features: [
      { text: '2 Feed Monitors' },
      { text: '20 min Refresh Rate' },
      { text: '3 Days Analytics' },
      { text: 'NovaFeeds Branding' },
      { text: 'Repost Tool', disabled: true },
      { text: 'Turbo Speed (2m)', disabled: true },
      { text: 'Priority Support', disabled: true },
    ],
  },
  1: {
    tier: 1,
    id: 'starter',
    title: 'Starter',
    name: 'Starter',
    description: 'Remove the noise',
    price: { mo: '4.99', yr: '49' },
    isPopular: false,
    limits: {
      maxMonitors: 10,
      minRefreshInterval: 10,
      maxPurge: 25,
      maxChannels: 5,
      maxPings: 5,
      maxAnalyticsDays: 7,
    },
    canCustomColor: true,
    canAlertTemplate: true,
    canCustomTemplate: false,
    canGenreFilter: true,
    canTmdbLanguageFilter: true,
    canRemoveBranding: true,
    canBulkImport: false,
    canBulkDelete: true,
    canRepost: false,
    hasNativePlayer: true,
    hasDiagnosticSuite: false,
    hasPrioritySupport: false,
    hasExportData: false,
    features: [
      { text: '10 Feed Monitors' },
      { text: '10 min Refresh Rate' },
      { text: 'Remove Branding', highlight: true },
      { text: '7 Days Analytics' },
      { text: 'Basic Diagnostic Tools' },
      { text: 'Repost Tool', disabled: true },
      { text: 'Turbo Speed (2m)', disabled: true },
    ],
  },
  2: {
    tier: 2,
    id: 'professional',
    title: 'Professional',
    name: 'Professional',
    description: 'The sweet spot for growth',
    price: { mo: '9.99', yr: '99' },
    isPopular: true,
    limits: {
      maxMonitors: 30,
      minRefreshInterval: 5,
      maxPurge: 50,
      maxChannels: 10,
      maxPings: 10,
      maxAnalyticsDays: 30,
    },
    canCustomColor: true,
    canAlertTemplate: true,
    canCustomTemplate: true,
    canGenreFilter: true,
    canTmdbLanguageFilter: true,
    canRemoveBranding: true,
    canBulkImport: true,
    canBulkDelete: true,
    canRepost: true,
    hasNativePlayer: true,
    hasDiagnosticSuite: false,
    hasPrioritySupport: false,
    hasExportData: false,
    features: [
      { text: '30 Feed Monitors' },
      { text: '5 min Refresh Rate' },
      { text: 'Unlock Repost Tool', highlight: true },
      { text: '30 Days Analytics' },
      { text: 'Custom Alert Branding' },
      { text: 'Remove Branding' },
      { text: 'Turbo Speed (2m)', disabled: true },
    ],
  },
  3: {
    tier: 3,
    id: 'ultimate',
    title: 'Ultimate',
    name: 'Ultimate',
    description: 'Unrivaled power & speed',
    price: { mo: '19.99', yr: '199' },
    isPopular: false,
    limits: {
      maxMonitors: 100,
      minRefreshInterval: 2,
      maxPurge: 100,
      maxChannels: 20,
      maxPings: 20,
      maxAnalyticsDays: 999,
    },
    canCustomColor: true,
    canAlertTemplate: true,
    canCustomTemplate: true,
    canGenreFilter: true,
    canTmdbLanguageFilter: true,
    canRemoveBranding: true,
    canBulkImport: true,
    canBulkDelete: true,
    canRepost: true,
    hasNativePlayer: true,
    hasDiagnosticSuite: true,
    hasPrioritySupport: true,
    hasExportData: true,
    features: [
      { text: '100 Feed Monitors', highlight: true },
      { text: '2 min Turbo Refresh', highlight: true },
      { text: 'Full Diagnostic Suite (100 Purge)' },
      { text: 'Lifetime Analytics' },
      { text: 'Priority Support' },
      { text: 'Unlock Repost Tool' },
      { text: 'Custom Branding' },
    ],
  },
};

export const MASTER_TIER_LIMITS: TierLimits = {
  maxMonitors: 1000,
  minRefreshInterval: 1,
  maxPurge: 100,
  maxChannels: 50,
  maxPings: 50,
  maxAnalyticsDays: 999,
};

export const DEFAULT_TIER_LIMITS = TIER_DEFINITIONS;

export const TIERS: TierItem[] = [
  TIER_DEFINITIONS[0],
  TIER_DEFINITIONS[1],
  TIER_DEFINITIONS[2],
  TIER_DEFINITIONS[3],
];

export const DEV_ROTATION_OPTIONS = [
  { value: 'random', label: 'Random Rotation' },
  { value: 'sequential', label: 'Sequential Rotation' },
];

export const DEV_ACTIVITY_OPTIONS = [
  { value: 'playing', label: 'Playing' },
  { value: 'watching', label: 'Watching' },
  { value: 'listening', label: 'Listening to' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'competing', label: 'Competing in' },
];

export const DEV_DURATION_OPTIONS = [
  { value: '30', label: '1 Month (30 Days)' },
  { value: '90', label: '3 Months (90 Days)' },
  { value: '180', label: '6 Months (180 Days)' },
  { value: '365', label: '1 Year (365 Days)' },
  { value: '0', label: 'Lifetime (Infinity)' },
  { value: 'custom', label: 'Custom Days...' },
];

export const DEV_TIER_OPTIONS = [
  { value: '1', label: 'Starter (Tier 1)' },
  { value: '2', label: 'Professional (Tier 2)' },
  { value: '3', label: 'Ultimate (Tier 3)' },
];

export interface ComparisonFeature {
  name: string;
  values: (string | boolean)[];
  highlight?: number[];
}

export interface ComparisonCategory {
  name: string;
  iconName: 'Zap' | 'Settings' | 'Shield' | 'BarChart3';
  features: ComparisonFeature[];
}

export const COMPARISON_TIERS = ['Free', 'Starter', 'Professional', 'Ultimate'];

export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    name: 'Monitoring Capacity',
    iconName: 'Zap',
    features: [
      {
        name: 'Max Feed Monitors',
        values: [0, 1, 2, 3].map((t) => String(TIER_DEFINITIONS[t].limits.maxMonitors)),
      },
      {
        name: 'Refresh Interval',
        values: [0, 1, 2, 3].map((t) => `${TIER_DEFINITIONS[t].limits.minRefreshInterval}m`),
        highlight: [3],
      },
      {
        name: 'Target Channels',
        values: [0, 1, 2, 3].map((t) => String(TIER_DEFINITIONS[t].limits.maxChannels)),
      },
      {
        name: 'Ping Roles',
        values: [0, 1, 2, 3].map((t) => String(TIER_DEFINITIONS[t].limits.maxPings)),
      },
    ],
  },
  {
    name: 'Management Tools',
    iconName: 'Settings',
    features: [
      {
        name: 'Live Repost Tool',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canRepost),
        highlight: [2, 3],
      },
      {
        name: 'Max Purge Limit',
        values: [0, 1, 2, 3].map((t) => String(TIER_DEFINITIONS[t].limits.maxPurge)),
      },
      { name: 'Manual Force Check', values: [true, true, true, true] },
      {
        name: 'Bulk Basic Actions',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canBulkDelete),
      },
      {
        name: 'Bulk Settings Edit',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canBulkImport),
        highlight: [2, 3],
      },
      {
        name: 'Bulk Import Wizard',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canBulkImport),
        highlight: [2, 3],
      },
    ],
  },
  {
    name: 'Branding & Customization',
    iconName: 'Shield',
    features: [
      {
        name: 'Remove Branding',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canRemoveBranding),
        highlight: [1, 2, 3],
      },
      {
        name: 'Custom Templates',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canCustomTemplate),
      },
      {
        name: 'Advanced Filters',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canGenreFilter),
      },
      {
        name: 'Custom Embed Color',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].canCustomColor),
      },
      {
        name: 'Native YouTube Player',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].hasNativePlayer),
      },
    ],
  },
  {
    name: 'Analytics & Logs',
    iconName: 'BarChart3',
    features: [
      {
        name: 'Analytics Range',
        values: [0, 1, 2, 3].map((t) => {
          const days = TIER_DEFINITIONS[t].limits.maxAnalyticsDays;
          return days >= 999 ? '∞' : `${days}d`;
        }),
      },
      { name: 'System Logs', values: [true, true, true, true] },
      {
        name: 'Export Data',
        values: [0, 1, 2, 3].map((t) => TIER_DEFINITIONS[t].hasExportData),
      },
    ],
  },
];


