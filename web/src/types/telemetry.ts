export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline' | string;
  uptime_seconds?: number;
  db_latency_ms?: number;
  active_guilds?: number;
  active_monitors_count?: number;
  queue_length?: number;
  environment?: string;
  version?: string;
}

export interface SystemTelemetry {
  status: string;
  version: string;
  mode: string;
  database: string;
  queue_backend: string;
  shards_count?: number;
  connected_guilds?: number;
  uptime_seconds?: number;
}

export type AuditLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  action: string;
  message: string;
  guild_id?: string;
  metadata?: Record<string, unknown>;
}
