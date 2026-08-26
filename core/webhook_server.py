import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import stripe_router, monitor_router, guild_router, admin_router
from models.api import HealthResponse

# OpenAPI Tags Metadata for documentation
tags_metadata = [
    {
        "name": "Admin & Telemetry",
        "description": "Dev Panel operations, structured logging queries, and Prometheus metrics telemetry.",
    },
    {
        "name": "Monitors",
        "description": "Feed ingestion monitor synchronization, manual checks, reposting, and history management.",
    },
    {
        "name": "Guilds",
        "description": "Discord server settings, tier entitlement querying, and member permission checks.",
    },
    {
        "name": "Stripe Billing",
        "description": "Stripe checkout session initiation and incoming webhook event dispatching.",
    },
]

app = FastAPI(
    title="Nova Discord Bot API",
    description="High-performance REST API, Webhooks, and Telemetry Service for Nova Discord Feed Bot.",
    version="1.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. CORS Middleware Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Versioned API v1 Routes (/api/v1/...)
app.include_router(admin_router, prefix="/api/v1")
app.include_router(monitor_router, prefix="/api/v1")
app.include_router(guild_router, prefix="/api/v1")
app.include_router(stripe_router, prefix="/api/v1")

# 3. Root Level Aliases for Direct Webhooks and Legacy Endpoints
app.include_router(admin_router)
app.include_router(monitor_router)
app.include_router(guild_router)
app.include_router(stripe_router)

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Admin & Telemetry"],
    summary="Service health check",
    description="Container and load balancer health check probe endpoint with connection pool diagnostics."
)
@app.get(
    "/api/v1/health",
    response_model=HealthResponse,
    tags=["Admin & Telemetry"],
    include_in_schema=False
)
async def health():
    from db.connection import check_db_health
    db_health = await check_db_health()
    status_str = "ok" if db_health.get("status") in ("healthy", "degraded") or not db_health.get("pool", {}).get("initialized") else "degraded"
    return HealthResponse(
        status=status_str,
        version="1.0.0",
        database=db_health
    )

def setup_webhook_bot(bot_instance):
    """Link the FastAPI server to the running Discord bot instance."""
    app.state.bot = bot_instance
    app.state.stripe_config = bot_instance.config.get("stripe_config", {}) if hasattr(bot_instance, "config") else {}

__all__ = ["app", "setup_webhook_bot"]
