from datetime import datetime, timezone
from typing import Any
from pydantic import Field
from models.base import DomainModel

class HealthResponse(DomainModel):
    """Health check response schema."""
    status: str = "ok"
    version: str = "1.0.0"
    database: dict[str, Any] | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ActionStatusResponse(DomainModel):
    """Generic operation status response schema."""
    status: str = "success"
    message: str

class LogFilterModel(DomainModel):
    """Filter parameters applied to structured log queries."""
    level: str | None = None
    guild_id: int | None = None
    platform: str | None = None
    search: str | None = None
    limit: int = 100

class LogsQueryResponse(DomainModel):
    """Structured logs query response schema for Dev Panel."""
    count: int
    filters: LogFilterModel
    logs: list[dict[str, Any]] = Field(default_factory=list)

class MetricsSummaryResponse(DomainModel):
    """Metrics and telemetry summary response schema."""
    uptime_seconds: float
    counters: dict[str, Any] = Field(default_factory=dict)
    gauges: dict[str, Any] = Field(default_factory=dict)
    latencies: dict[str, Any] = Field(default_factory=dict)

class GuildPermissionsResponse(DomainModel):
    """User permissions and guild subscription tier overview response schema."""
    is_admin: bool = False
    tier: int = 0
    tier_name: str = "Unknown"
    features: list[str] = Field(default_factory=list)
    limits: dict[str, Any] = Field(default_factory=dict)
    bot_in_guild: bool = False

__all__ = [
    "HealthResponse",
    "ActionStatusResponse",
    "LogFilterModel",
    "LogsQueryResponse",
    "MetricsSummaryResponse",
    "GuildPermissionsResponse",
]
