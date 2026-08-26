from fastapi import APIRouter, Query, Depends, status
from fastapi.responses import PlainTextResponse
from logger import get_recent_logs
from services.metrics_service import metrics
from models.api import LogsQueryResponse, MetricsSummaryResponse, LogFilterModel
from api.dependencies import verify_webhook_secret, rate_limit

admin_router = APIRouter(tags=["Admin & Telemetry"])

@admin_router.get(
    "/admin/logs",
    response_model=LogsQueryResponse,
    summary="Query structured logs",
    description="Retrieve filtered structured log records from the in-memory circular ring buffer for Dev Panel dashboards."
)
async def get_logs_endpoint(
    limit: int = Query(default=100, ge=1, le=500, description="Maximum number of log entries to retrieve"),
    level: str | None = Query(default=None, description="Log level filter (DEBUG, INFO, WARNING, ERROR, CRITICAL)"),
    guild_id: int | None = Query(default=None, description="Filter by Discord Guild ID"),
    platform: str | None = Query(default=None, description="Filter by monitor platform name"),
    search: str | None = Query(default=None, description="Free text search in log messages"),
    authorized: bool = Depends(verify_webhook_secret),
    _rate_limited: bool = Depends(rate_limit),
):
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
    return LogsQueryResponse(
        count=len(logs),
        filters=LogFilterModel(
            level=eff_level,
            guild_id=eff_guild_id,
            platform=eff_platform,
            search=eff_search,
            limit=eff_limit
        ),
        logs=logs
    )

@admin_router.get(
    "/admin/metrics",
    response_model=MetricsSummaryResponse,
    summary="Telemetry metrics summary",
    description="Retrieve high-level telemetry, execution latencies, and counter totals in JSON format."
)
async def get_metrics_summary_endpoint(
    authorized: bool = Depends(verify_webhook_secret),
    _rate_limited: bool = Depends(rate_limit),
):
    data = metrics.export_summary()
    return MetricsSummaryResponse(**data)

@admin_router.get(
    "/metrics",
    response_class=PlainTextResponse,
    summary="Prometheus metrics exporter",
    description="Prometheus text exposition format endpoint for scraping telemetry metrics.",
    include_in_schema=True
)
async def prometheus_metrics_endpoint(_rate_limited: bool = Depends(rate_limit)):
    return PlainTextResponse(
        content=metrics.export_prometheus(),
        media_type="text/plain; version=0.0.4"
    )
