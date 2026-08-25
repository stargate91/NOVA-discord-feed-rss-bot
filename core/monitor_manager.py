import asyncio
from db import monitor_repo
from logger import log
from engine import SharedDataCache, FeedPipeline, PollingScheduler
from services import MaintenanceService

class MonitorManager:
    """Coordinator managing active monitors, polling lifecycle, caching, and maintenance operations."""

    def __init__(self, bot, config):
        self.bot = bot
        self.config = config
        self.monitors = []

        # Modular Engine & Service Components
        self.cache = SharedDataCache(default_ttl=120)
        self.pipeline = FeedPipeline(bot=self.bot)
        self.maintenance = MaintenanceService(bot=self.bot)
        self.scheduler = PollingScheduler(
            bot=self.bot,
            pipeline=self.pipeline,
            get_monitors_callback=lambda: self.monitors
        )

    # --- Properties & Cache Delegates ---

    @property
    def is_running(self) -> bool:
        return self.scheduler.is_running

    @is_running.setter
    def is_running(self, val: bool):
        self.scheduler.is_running = val

    @property
    def tmdb_genres_cache(self) -> dict:
        return self.cache.tmdb_genres_cache

    def get_shared_data(self, key: str, max_age_seconds: int = 120):
        """Get shared data from cache if it's still fresh."""
        return self.cache.get_shared_data(key, max_age_seconds=max_age_seconds)

    def set_shared_data(self, key: str, data):
        """Store data in the shared cache."""
        self.cache.set_shared_data(key, data)

    # --- Monitor Lifecycle ---

    def add_monitor(self, monitor_instance):
        """Add an already instantiated monitor."""
        self.monitors.append(monitor_instance)
        log.info(f"Added monitor: {monitor_instance.name} ({monitor_instance.platform}) | Enabled: {monitor_instance.enabled}")

    async def sync_with_db(self, is_startup=False) -> bool:
        """Reload all monitors and guild settings from database."""
        log.info("Synchronizing monitors and guild settings with database...")
        await self.bot.reload_guild_settings_cache()
        from core.monitor_factory import create_monitor_instance

        try:
            # Track old assignments to detect new ones
            old_assignments = {}
            if self.monitors:
                for m in self.monitors:
                    old_assignments[m.id] = set(m.target_channels)

            # Capture states of existing monitors to preserve them across sync
            old_states = {}
            for m in self.monitors:
                state = {}
                if hasattr(m, 'is_live'): state['is_live'] = m.is_live
                if hasattr(m, 'is_first_run'): state['is_first_run'] = m.is_first_run
                if state: old_states[m.id] = state

            db_monitors = await monitor_repo.get_all_monitors()
            new_monitors = []
            for m_config in db_monitors:
                extra = m_config.get("extra_settings", {})
                if isinstance(extra, str):
                    try:
                        import json
                        extra = json.loads(extra)
                    except Exception:
                        extra = {}

                full_config = {**m_config, **extra}
                monitor = create_monitor_instance(self.bot, full_config)
                if monitor:
                    monitor.is_silent_start = is_startup or not monitor.send_initial_alert

                    if monitor.id in old_states:
                        state = old_states[monitor.id]
                        if 'is_live' in state: monitor.is_live = state['is_live']
                        if 'is_first_run' in state: monitor.is_first_run = state['is_first_run']
                        monitor.is_silent_start = True

                    new_monitors.append(monitor)

            # Announce new assignments if not startup
            if not is_startup:
                for m in new_monitors:
                    if not m.enabled: continue
                    old_chans = old_assignments.get(m.id, set())
                    new_chans = set(m.target_channels)
                    added_chans = new_chans - old_chans

                    for ch_id in added_chans:
                        asyncio.create_task(self.announce_monitor(m, ch_id))

            # Atomic update of the monitor list
            self.monitors = new_monitors

            # Reset scheduler timers to ensure freshness
            self.scheduler.group_last_checked.clear()
            self.scheduler.unshared_last_checked.clear()

            log.info(f"Sync complete. Now tracking {len(self.monitors)} monitors.")
            return True
        except Exception as e:
            log.error(f"Failed to sync monitors: {e}", exc_info=True)
            return False

    async def announce_monitor(self, monitor, channel_id):
        """Send a localized announcement message to a newly assigned channel."""
        try:
            channel = self.bot.get_channel(int(channel_id))
            if not channel:
                channel = await self.bot.fetch_channel(int(channel_id))

            if channel:
                msg = self.bot.get_feedback("monitor_assigned_announcement", name=monitor.name, guild_id=monitor.guild_id)
                await channel.send(msg)
                log.info(f"Announced monitor '{monitor.name}' in channel #{channel.name} ({channel_id})")
        except Exception as e:
            log.error(f"Failed to announce monitor '{monitor.name}' in channel {channel_id}: {e}")

    # --- Poller Loop ---

    async def start_loop(self):
        """Start the background monitoring loop centrally."""
        await self.scheduler.start_loop()

    def stop_loop(self):
        """Stop the background monitoring loop."""
        self.scheduler.stop_loop()

    # --- Maintenance Operations ---

    async def manual_check(self, monitor_id: int):
        """Force an immediate update check for a specific monitor."""
        monitor = next((m for m in self.monitors if m.id == monitor_id), None)
        return await self.maintenance.manual_check(monitor)

    async def repost_recent(self, monitor_id: int, count: int = 1):
        """Fetch latest items directly from source and post them."""
        monitor = next((m for m in self.monitors if m.id == monitor_id), None)
        return await self.maintenance.repost_recent(monitor, count)

    async def reset_history(self, monitor_id: int):
        """Clear the publication history in DB for a specific monitor."""
        monitor = next((m for m in self.monitors if m.id == monitor_id), None)
        return await self.maintenance.reset_history(monitor)

    async def reset_all_history(self):
        """Clear ALL publication history globally."""
        return await self.maintenance.reset_all_history()

    async def factory_reset(self):
        """WIPE EVERYTHING: Database tables and in-memory monitors."""
        success = await self.maintenance.factory_reset()
        if success:
            self.monitors.clear()
        return success

    async def purge_channel(self, monitor_id: int, amount: int = 50):
        """Delete recent messages in the target Discord channels of this monitor."""
        monitor = next((m for m in self.monitors if m.id == monitor_id), None)
        return await self.maintenance.purge_channel(monitor, amount)
