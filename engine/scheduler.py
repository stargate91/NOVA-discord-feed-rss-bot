import asyncio
import time
from logger import log

class PollingScheduler:
    """Orchestrates bounded concurrent polling of active monitors with dynamic, tier-based intervals and daily retention cleanup."""

    def __init__(self, bot, pipeline, get_monitors_callback, max_concurrency: int = 15):
        self.bot = bot
        self.pipeline = pipeline
        self.get_monitors = get_monitors_callback
        self.is_running = False
        self.group_last_checked: dict[str, float] = {}
        self.unshared_last_checked: dict[int, float] = {}
        self.last_retention_cleanup: float = 0.0
        self.semaphore = asyncio.Semaphore(max_concurrency)

    def stop_loop(self):
        """Signal the polling loop to stop."""
        self.is_running = False
        log.info("PollingScheduler loop stopping...")

    async def start_loop(self):
        """Start the background monitoring polling loop with bounded concurrency."""
        if self.is_running:
            return

        self.is_running = True
        log.info("Starting PollingScheduler in Concurrent Poller mode with dynamic intervals")

        await self.bot.wait_until_ready()

        while self.is_running and not self.bot.is_closed():
            monitors = self.get_monitors()

            # 1. Group monitors by shared feed key to avoid redundant API polling
            groups: dict[str, list] = {}
            unshared: list = []

            for monitor in monitors:
                if not monitor.enabled:
                    continue
                try:
                    key = monitor.get_shared_key()
                    if key:
                        groups.setdefault(key, []).append(monitor)
                    else:
                        unshared.append(monitor)
                except Exception as e:
                    log.error(f"[Scheduler] Error getting shared key for {monitor.name}: {e}")

            now = time.time()
            tasks = []

            # 2. Gather Eligible Shared Groups
            for key, monitors_in_group in groups.items():
                if not self.is_running or self.bot.is_closed():
                    break

                min_interval_mins = min(self.bot.get_guild_refresh_interval(m.guild_id) for m in monitors_in_group)
                min_interval_secs = min_interval_mins * 60

                last_checked = self.group_last_checked.get(key, 0)
                if now - last_checked < min_interval_secs:
                    continue

                self.group_last_checked[key] = now
                tasks.append(self._run_group_task(key, monitors_in_group, min_interval_mins))

            # 3. Gather Eligible Unshared Monitors
            for monitor in unshared:
                if not self.is_running or self.bot.is_closed():
                    break

                interval_secs = self.bot.get_guild_refresh_interval(monitor.guild_id) * 60
                last_checked = self.unshared_last_checked.get(monitor.id, 0)

                if now - last_checked < interval_secs:
                    continue

                self.unshared_last_checked[monitor.id] = now
                tasks.append(self._run_unshared_task(monitor))

            # 4. Execute all eligible feed tasks concurrently within semaphore limit
            if tasks:
                log.debug(f"[Scheduler] Executing {len(tasks)} feed polling tasks in parallel...")
                await asyncio.gather(*tasks, return_exceptions=True)

            # 5. Periodic Daily Data Retention Cleanup (every 24 hours)
            if now - self.last_retention_cleanup > 86400:
                self.last_retention_cleanup = now
                asyncio.create_task(self._run_retention_cleanup())

            # Heartbeat tick: sleep 60 seconds
            try:
                await asyncio.sleep(60)
            except asyncio.CancelledError:
                break

    async def _run_group_task(self, key: str, monitors_in_group: list, interval_mins: int):
        """Execute a shared group pipeline task within the concurrency limit."""
        async with self.semaphore:
            try:
                await self.pipeline.process_group(key, monitors_in_group, interval_mins)
            except Exception as e:
                log.error(f"[Scheduler] Error processing shared group '{key}': {e}", exc_info=True)

    async def _run_unshared_task(self, monitor):
        """Execute an unshared monitor pipeline task within the concurrency limit."""
        async with self.semaphore:
            try:
                await self.pipeline.process_unshared(monitor)
            except Exception as e:
                log.error(f"[Scheduler] Error processing unshared monitor '{monitor.name}': {e}", exc_info=True)

    async def _run_retention_cleanup(self):
        """Clean up old publication history in the background once a day."""
        try:
            from db import monitor_repo
            await monitor_repo.cleanup_old_history(days=60)
        except Exception as e:
            log.error(f"[Scheduler] Daily retention cleanup failed: {e}")
