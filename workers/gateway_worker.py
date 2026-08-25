import asyncio
import os
from logger import log, setup_logging
from core.config import BotConfig
from db import create_db_pool, init_db, close
from core.bot import FeedBot
from services import get_notification_queue, QueueConsumerWorker

async def run_gateway_worker():
    """
    Standalone Discord Gateway Bot Microservice:
    Connects to Discord Gateway and consumes notification tasks from the Queue,
    dispatching them to Discord channels with rate-limit and dead-channel protection.
    """
    setup_logging()
    log.info("[Gateway Worker] Starting Discord Gateway microservice...")

    config = BotConfig.load()
    dsn = config.get("database_url")
    if dsn:
        await create_db_pool(dsn)
        await init_db()

    token = config.get("token")
    if not token:
        log.critical("[Gateway Worker] No BOT_TOKEN found!")
        return

    # Initialize bot
    bot = FeedBot(config)

    # Initialize queue and queue consumer
    redis_url = config.get("redis_url") or os.getenv("REDIS_URL")
    q = get_notification_queue(redis_url)
    consumer = QueueConsumerWorker(delivery_adapter=bot.delivery_adapter, queue=q)

    log.info(f"[Gateway Worker] Gateway ready (Queue: {type(q).__name__})")

    try:
        # Start queue consumer in background
        consumer.start()

        async with bot:
            await bot.start(token)
    finally:
        consumer.stop()
        await close()
        log.info("[Gateway Worker] Gateway worker closed.")

if __name__ == "__main__":
    asyncio.run(run_gateway_worker())
