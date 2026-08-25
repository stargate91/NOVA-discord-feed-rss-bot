import asyncio
import os
import sys
import argparse
from logger import log, setup_logging
from core.config import BotConfig
from db import create_db_pool, init_db, close
from core.bot import FeedBot
from workers import run_api_worker, run_feed_worker, run_gateway_worker

async def run_monolith():
    """Default Standalone Mode: Runs Bot, Webhook Server, and Ingestion in a single unified process."""
    setup_logging()
    
    try:
        # Load configuration
        config = BotConfig.load()
        
        # Initialize Database
        dsn = config.get("database_url")
        if not dsn:
            log.critical("DATABASE_URL is not set in .env! Cannot start bot.")
            return

        try:
            await create_db_pool(
                dsn,
                min_size=2,
                max_size=20,
                max_queries=50000,
                max_inactive_connection_lifetime=300.0,
                command_timeout=30.0
            )
            await init_db()
            log.info("Successfully connected to PostgreSQL with tuned connection pool (min: 2, max: 20).")
        except Exception as e:
            log.critical(f"Failed to connect to PostgreSQL: {e}")
            return
        
        token = config.get("token")
        if not token:
            log.critical("No BOT_TOKEN found! Please set it in .env or config.json.")
            return

        # Initialize Bot
        bot = FeedBot(config)
        
        # Initialize Webhook Server
        from core.webhook_server import app, setup_webhook_bot
        import uvicorn
        
        setup_webhook_bot(bot)
        
        # Start Webhook Server in background
        web_config = uvicorn.Config(
            app, 
            host=os.getenv("WEBHOOK_HOST", "0.0.0.0"), 
            port=int(os.getenv("WEBHOOK_PORT", 8080)),
            log_level="error"
        )
        server = uvicorn.Server(web_config)
        asyncio.create_task(server.serve())
        log.info(f"Webhook server started on {os.getenv('WEBHOOK_HOST', '0.0.0.0')}:{os.getenv('WEBHOOK_PORT', 8080)}")

        # Start Bot
        async with bot:
            await bot.start(token)
            
    except KeyboardInterrupt:
        log.info("Shutdown requested via KeyboardInterrupt.")
    except Exception as e:
        log.critical(f"Critical error during startup: {e}", exc_info=True)
    finally:
        await close()
        log.info("Feed Bot closed.")

def main():
    parser = argparse.ArgumentParser(description="Nova Feed Bot Service Runner")
    parser.add_argument(
        "--mode",
        choices=["all", "api", "worker", "gateway"],
        default=os.getenv("SERVICE_MODE", "all"),
        help="Execution mode: 'all' (monolith), 'api' (FastAPI server), 'worker' (feed ingestion), 'gateway' (Discord bot)"
    )
    args = parser.parse_args()

    mode = args.mode.lower()
    if mode == "api":
        asyncio.run(run_api_worker())
    elif mode == "worker":
        asyncio.run(run_feed_worker())
    elif mode == "gateway":
        asyncio.run(run_gateway_worker())
    else:
        asyncio.run(run_monolith())

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
