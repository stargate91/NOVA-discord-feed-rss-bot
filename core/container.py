from logger import log
from db import guild_repo, monitor_repo, bot_settings_repo
from engine.cache import BoundedGuildSettingsCache
from core.monitor_manager import MonitorManager
from clients import http_client
from services import (
    LocalizationService,
    EntitlementService,
    PermissionService,
    CryptoService,
    DiscordDeliveryAdapter,
    NotificationService,
    BaseDeliveryAdapter
)

class BotContainer:
    """
    Composition Root and Dependency Injection Container for Nova Discord Bot.
    Manages services, caches, adapters, and monitor orchestrators in a decoupled manner.
    """

    def __init__(self, config, bot=None, delivery_adapter: BaseDeliveryAdapter | None = None):
        self.config = config
        self.bot = bot
        self.guild_settings_cache = BoundedGuildSettingsCache(max_size=5000)

        # Core Domain Services
        self.i18n = LocalizationService(bot=self.bot)
        self.entitlements = EntitlementService(bot=self.bot, config=self.config)
        self.permissions = PermissionService(bot=self.bot, config=self.config)
        self.crypto_service = CryptoService(bot=self.bot)

        # Delivery & Notification Services
        self.delivery_adapter = delivery_adapter or DiscordDeliveryAdapter(self.bot)
        self.notifications = NotificationService(self.bot, self.delivery_adapter)

        # Ingestion & Monitor Coordinator
        self.monitor_manager = MonitorManager(self.bot, self.config)

    def bind_bot(self, bot):
        """Update bot reference on all container services when bot instance is created."""
        self.bot = bot
        self.i18n.bot = bot
        self.entitlements.bot = bot
        self.permissions.bot = bot
        self.crypto_service.bot = bot
        if hasattr(self.delivery_adapter, "bot"):
            self.delivery_adapter.bot = bot
        self.notifications.bot = bot
        self.monitor_manager.bot = bot
        self.monitor_manager.pipeline.bot = bot
        self.monitor_manager.maintenance.bot = bot
        self.monitor_manager.scheduler.bot = bot

    async def reload_guild_settings_cache(self) -> bool:
        """Reload all guild settings from PostgreSQL into the bounded LRU cache."""
        try:
            settings_list = await guild_repo.get_all_guild_settings()
            cache = BoundedGuildSettingsCache(max_size=5000)
            for s in settings_list:
                if s.guild_id is not None:
                    cache[s.guild_id] = s
            self.guild_settings_cache = cache
            log.info(f"Guild settings cache reloaded. ({len(self.guild_settings_cache)} guilds)")
            return True
        except Exception as e:
            log.error(f"Error loading guild settings cache: {e}")
            return False

    async def initialize(self):
        """Initialize localization packs, caches, DB settings, monitors, and crypto service."""
        # 1. Load localization files
        self.i18n.load_locales("locales")

        # 2. Load all guild settings into bounded LRU cache
        await self.reload_guild_settings_cache()

        # 3. Load Global Settings from DB
        p_interval = await bot_settings_repo.get_bot_setting("presence_interval_seconds")
        if p_interval:
            self.config["presence_interval_seconds"] = int(p_interval)

        r_interval = await bot_settings_repo.get_bot_setting("refresh_interval_minutes")
        if r_interval:
            self.config["refresh_interval_minutes"] = int(r_interval)

        a_channel = await bot_settings_repo.get_bot_setting("admin_channel_id")
        if a_channel:
            self.config["admin_channel_id"] = int(a_channel)

        # 4. Start Crypto Service
        await self.crypto_service.start()

        # 5. Load monitors from DB
        from core.monitor_factory import MonitorFactory
        db_monitors = await monitor_repo.get_all_monitors()
        for m_config in db_monitors:
            monitor = MonitorFactory.create(self.bot, m_config)
            if monitor:
                self.monitor_manager.add_monitor(monitor)
            else:
                log.warning(f"Unknown monitor type in DB: {m_config.get('type')}")

    async def shutdown(self):
        """Gracefully cleanup and close all container managed resources."""
        if hasattr(self, 'crypto_service') and self.crypto_service:
            await self.crypto_service.stop()
        await http_client.close()

__all__ = ["BotContainer"]
