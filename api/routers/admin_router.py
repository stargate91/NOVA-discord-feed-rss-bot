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
    logs = get_recent_logs(
        limit=limit,
        level=level,
        guild_id=guild_id,
        platform=platform,
        search=search
    )
    return {
        "count": len(logs),
        "filters": {
            "level": level,
            "guild_id": guild_id,
            "platform": platform,
            "search": search,
            "limit": limit
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
