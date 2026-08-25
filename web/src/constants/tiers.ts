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

export const TIERS: TierItem[] = [
  {
    tier: 0,
    title: "Free",
    description: "For small hobby projects",
    price: { mo: "0", yr: "0" },
    features: [
      { text: "2 Feed Monitors" },
      { text: "20 min Refresh Rate" },
      { text: "3 Days Analytics" },
      { text: "NovaFeeds Branding" },
      { text: "Repost Tool", disabled: true },
      { text: "Turbo Speed (2m)", disabled: true },
      { text: "Priority Support", disabled: true }
    ]
  },
  {
    tier: 1,
    title: "Starter",
    description: "Remove the noise",
    price: { mo: "4.99", yr: "49" },
    isPopular: false,
    features: [
      { text: "10 Feed Monitors" },
      { text: "10 min Refresh Rate" },
      { text: "Remove Branding", highlight: true },
      { text: "7 Days Analytics" },
      { text: "Basic Diagnostic Tools" },
      { text: "Repost Tool", disabled: true },
      { text: "Turbo Speed (2m)", disabled: true }
    ]
  },
  {
    tier: 2,
    title: "Professional",
    description: "The sweet spot for growth",
    price: { mo: "9.99", yr: "99" },
    isPopular: true,
    features: [
      { text: "30 Feed Monitors" },
      { text: "5 min Refresh Rate" },
      { text: "Unlock Repost Tool", highlight: true },
      { text: "30 Days Analytics" },
      { text: "Custom Alert Branding" },
      { text: "Remove Branding" },
      { text: "Turbo Speed (2m)", disabled: true }
    ]
  },
  {
    tier: 3,
    title: "Ultimate",
    description: "Unrivaled power & speed",
    price: { mo: "19.99", yr: "199" },
    isPopular: false,
    features: [
      { text: "100 Feed Monitors", highlight: true },
      { text: "2 min Turbo Refresh", highlight: true },
      { text: "Full Diagnostic Suite (100 Purge)" },
      { text: "Lifetime Analytics" },
      { text: "Priority Support" },
      { text: "Unlock Repost Tool" },
      { text: "Custom Branding" }
    ]
  }
];

export const DEV_ROTATION_OPTIONS = [
  { value: 'random', label: 'Random Rotation' },
  { value: 'sequential', label: 'Sequential Rotation' }
];

export const DEV_ACTIVITY_OPTIONS = [
  { value: 'playing', label: 'Playing' },
  { value: 'watching', label: 'Watching' },
  { value: 'listening', label: 'Listening to' },
  { value: 'streaming', label: 'Streaming' },
  { value: 'competing', label: 'Competing in' }
];

export const DEV_DURATION_OPTIONS = [
  { value: '30', label: '1 Month (30 Days)' },
  { value: '90', label: '3 Months (90 Days)' },
  { value: '180', label: '6 Months (180 Days)' },
  { value: '365', label: '1 Year (365 Days)' },
  { value: '0', label: 'Lifetime (Infinity)' },
  { value: 'custom', label: 'Custom Days...' }
];

export const DEV_TIER_OPTIONS = [
  { value: '1', label: 'Scout (Tier 1)' },
  { value: '2', label: 'Operator (Tier 2)' },
  { value: '3', label: 'Architect (Tier 3)' }
];
