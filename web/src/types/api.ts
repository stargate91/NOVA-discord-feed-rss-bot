export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'ok';
  message?: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

export interface AnalyticsStats {
  totalMonitors?: number;
  activeMonitors: number;
  totalPosts: number;
  totalAlertsSent?: number;
  alertsLast24h?: number;
  platformCount?: number;
  platforms?: Array<{ platform: string; displayName?: string; count: number }>;
  history?: Array<{ date: string; count: string | number }>;
  heatmap?: Array<{ day: number; hour: number; count: number }>;
  tier?: number;
  isMaster?: boolean;
  isPremium?: boolean;
  [key: string]: any;
}

export interface GlobalDashboardStats {
  activeMonitors: number;
  totalPosts: number;
  totalGuilds?: number;
  totalMonitorsCount?: number;
  tierName?: string;
  tier?: number;
  isLifetime?: boolean;
  maxMonitors?: number;
  error?: string;
  [key: string]: any;
}

export interface GuildDashboardStats {
  activeMonitors: number;
  totalMonitorsCount: number;
  totalPosts: number;
  tier: number;
  tierName: string;
  maxMonitors: number;
  isMaster: boolean;
  isLifetime: boolean;
  error?: string;
  [key: string]: any;
}

export interface BotHealthStats {
  status: string;
  wsPingMs: number;
  guildsCount: number;
  monitorsActive: number;
  uptimeSeconds: number;
  dbLatencyMs: number;
}
