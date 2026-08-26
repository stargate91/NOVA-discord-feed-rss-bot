import asyncio
import os
from logger import log, setup_logging
from core.config import BotConfig
from db import create_db_pool, init_db, close, monitor_repo
from core.monitor_factory import MonitorFactory
from services import get_notification_queue, QueueDeliveryAdapter

async def run_feed_worker(poll_interval: int = 60):
    """
    Standalone Feed Ingestion Worker:
    Continuously fetches feeds, deduplicates entries, and pushes notifications onto the Queue.
    Requires ZERO Discord credentials and runs completely decoupled from Discord API.
    """
    setup_logging()
    log.info("[Feed Worker] Starting standalone feed ingestion worker...")

    config = BotConfig.load()
    dsn = config.get("database_url")
    if not dsn:
        log.critical("[Feed Worker] DATABASE_URL is not set!")
        return

    await create_db_pool(dsn)
    await init_db()

    # Initialize queue and delivery adapter
    redis_url = config.get("redis_url") or os.getenv("REDIS_URL")
    q = get_notification_queue(redis_url)
    delivery_adapter = QueueDeliveryAdapter(queue=q)

    log.info(f"[Feed Worker] Ingestion engine ready (Queue: {type(q).__name__}, Poll interval: {poll_interval}s)")

    try:
        while True:
            try:
                monitors_config = await monitor_repo.get_all_monitors()
                log.info(f"[Feed Worker] Polling {len(monitors_config)} active monitors...")

                for m_config in monitors_config:
                    if not m_config.enabled:
                        continue
                    try:
                        # Instantiate monitor with QueueDeliveryAdapter
                        monitor = MonitorFactory.create(bot=None, config=m_config)
                        if monitor:
                            monitor.delivery_adapter = delivery_adapter
                            new_items = await monitor.fetch_new_items()
                            if new_items:
                                for item in new_items:
                                    await monitor.process_item(item)
                                await monitor.mark_items_published(new_items)
                                log.info(f"[Feed Worker] Discovered {len(new_items)} new items for {monitor.name}")
                    except Exception as e:
                        log.error(f"[Feed Worker] Error processing monitor {m_config.name}: {e}")

            except Exception as e:
                log.error(f"[Feed Worker] Pipeline cycle error: {e}", exc_info=True)

            await asyncio.sleep(poll_interval)
    except asyncio.CancelledError:
        log.info("[Feed Worker] Shutdown signal received.")
    finally:
        await close()
        log.info("[Feed Worker] Ingestion worker closed.")

if __name__ == "__main__":
    asyncio.run(run_feed_worker())
