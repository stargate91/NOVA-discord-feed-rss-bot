export type PageView = 'home' | 'dashboard' | 'admin';

export interface HealthStatus {
  status: string;
  uptime_seconds?: number;
  db_latency_ms?: number;
  active_guilds?: number;
  environment?: string;
}

export interface GuildSummary {
  guild_id: number;
  name: string;
  tier: number;
  active_monitors: number;
  max_monitors: number;
  refresh_interval: number;
  language: string;
}

export interface SystemTelemetry {
  status: string;
  version: string;
  mode: string;
  database: string;
  queue_backend: string;
}
