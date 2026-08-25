from fastapi import APIRouter, Query, Response
from fastapi.responses import PlainTextResponse
from logger import get_recent_logs
from services.metrics_service import metrics

admin_router = APIRouter(tags=["Admin & Telemetry"])

@admin_router.get("/api/admin/logs")
async def get_logs_endpoint(
    limit: int = Query(default=100, ge=1, le=500),
    level: str | None = Query(default=None),
    guild_id: int | None = Query(default=None),
    platform: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    """Retrieve filtered structured log records from the in-memory ring buffer for Dev Panel."""
    # Normalize when invoked directly in tests without FastAPI DI
    eff_limit = 100 if not isinstance(limit, int) else limit
    eff_level = None if not isinstance(level, str) else level
    eff_guild_id = None if not isinstance(guild_id, int) else guild_id
    eff_platform = None if not isinstance(platform, str) else platform
    eff_search = None if not isinstance(search, str) else search

    logs = get_recent_logs(
        limit=eff_limit,
        level=eff_level,
        guild_id=eff_guild_id,
        platform=eff_platform,
        search=eff_search
    )
    return {
        "count": len(logs),
        "filters": {
            "level": eff_level,
            "guild_id": eff_guild_id,
            "platform": eff_platform,
            "search": eff_search,
            "limit": eff_limit
        },
        "logs": logs
    }

@admin_router.get("/api/admin/metrics")
async def get_metrics_summary_endpoint():
    """Retrieve high-level telemetry summary in JSON format for Dev Panel dashboard widgets."""
    return metrics.export_summary()

@admin_router.get("/metrics", response_class=PlainTextResponse)
async def prometheus_metrics_endpoint():
    """Prometheus exposition format endpoint for scraping telemetry metrics."""
    return PlainTextResponse(
        content=metrics.export_prometheus(),
        media_type="text/plain; version=0.0.4"
    )
