import asyncio
import os
import uvicorn
from logger import log, setup_logging
from core.config import BotConfig
from db import create_db_pool, init_db, close
from core.webhook_server import app

async def run_api_worker():
    """Standalone API Microservice: Serves FastAPI web dashboard, Dev Panel, logs, metrics & Stripe webhooks."""
    setup_logging()
    log.info("[API Worker] Starting standalone API microservice...")

    config = BotConfig.load()
    dsn = config.get("database_url")
    if dsn:
        await create_db_pool(dsn)
        await init_db()

    host = os.getenv("WEBHOOK_HOST", "0.0.0.0")
    port = int(os.getenv("WEBHOOK_PORT", 8080))

    web_config = uvicorn.Config(
        app,
        host=host,
        port=port,
        log_level="info"
    )
    server = uvicorn.Server(web_config)
    log.info(f"[API Worker] API Server listening on {host}:{port}")

    try:
        await server.serve()
    finally:
        await close()
        log.info("[API Worker] API Server terminated.")

if __name__ == "__main__":
    asyncio.run(run_api_worker())
