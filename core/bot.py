import os
import discord
from discord.ext import commands
from logger import log
from core.container import BotContainer

class FeedBot(commands.Bot):
    """
    Lean Discord Gateway Client orchestrating extensions, containers, and lifecycle events.
    """

    def __init__(self, config, container: BotContainer | None = None):
        # Lightweight intents tailored for Feed & Alert operations
        intents = discord.Intents.default()
        intents.message_content = True
        intents.presences = False
        intents.typing = False
        intents.voice_states = False
        intents.invites = False
        intents.integrations = False
        intents.webhooks = False

        prefix = config.get("command_prefix", "!")
        super().__init__(
            command_prefix=prefix,
            intents=intents,
            max_messages=None,  # Disable message memory cache
            chunk_guilds_at_startup=False,  # Skip slow member chunking on startup
            member_cache_flags=discord.MemberCacheFlags.none()  # Disable in-memory member tracking
        )
        self.config = config
        self.container = container or BotContainer(config=self.config, bot=self)
        self.container.bind_bot(self)

    # --- Container Service & Cache Delegates ---

    @property
    def guild_settings_cache(self):
        return self.container.guild_settings_cache

    @guild_settings_cache.setter
    def guild_settings_cache(self, val):
        self.container.guild_settings_cache = val

    @property
    def monitor_manager(self):
        return self.container.monitor_manager

    @monitor_manager.setter
    def monitor_manager(self, val):
        self.container.monitor_manager = val

    @property
    def i18n(self):
        return self.container.i18n

    @property
    def entitlements(self):
        return self.container.entitlements

    @property
    def permissions(self):
        return self.container.permissions

    @property
    def crypto_service(self):
        return self.container.crypto_service

    @property
    def delivery_adapter(self):
        return self.container.delivery_adapter

    @property
    def notifications(self):
        return self.container.notifications

    async def reload_guild_settings_cache(self) -> bool:
        """Delegate cache reload to container."""
        return await self.container.reload_guild_settings_cache()

    async def setup_hook(self):
        """Initialize container dependencies, load extensions, and start monitor loops."""
        await self.container.initialize()
        await self.load_all_extensions()
        self.monitor_task = self.loop.create_task(self.monitor_manager.start_loop())

    async def load_all_extensions(self):
        """Locate and load all cogs from the cogs/ directory."""
        if not os.path.exists("cogs"):
            return

        for filename in os.listdir("cogs"):
            if filename.endswith("_cog.py"):
                try:
                    await self.load_extension(f"cogs.{filename[:-3]}")
                    log.info(f"Loaded extension: {filename}")
                except Exception as e:
                    log.error(f"Failed to load extension {filename}: {e}", exc_info=True)

    # --- Gateway Lifecycle Event Delegates (Backwards-compatibility) ---

    async def on_ready(self):
        """Gateway ready event delegate."""
        cog = self.get_cog("guild_lifecycle")
        if cog:
            await cog.on_ready()
        else:
            from cogs.guild_lifecycle_cog import GuildLifecycleCog
            await GuildLifecycleCog(self).on_ready()

    async def on_guild_join(self, guild: discord.Guild):
        """Guild join event delegate."""
        cog = self.get_cog("guild_lifecycle")
        if cog:
            await cog.on_guild_join(guild)
        else:
            from cogs.guild_lifecycle_cog import GuildLifecycleCog
            await GuildLifecycleCog(self).on_guild_join(guild)

    async def on_guild_remove(self, guild: discord.Guild):
        """Guild remove event delegate."""
        cog = self.get_cog("guild_lifecycle")
        if cog:
            await cog.on_guild_remove(guild)
        else:
            from cogs.guild_lifecycle_cog import GuildLifecycleCog
            await GuildLifecycleCog(self).on_guild_remove(guild)

    async def on_message(self, message: discord.Message):
        """Filter unauthorized master guild messages and process command routing."""
        if message.author.bot:
            return

        prefix = self.command_prefix
        if message.content.startswith(prefix):
            filter_cog = self.get_cog("command_filter")
            if filter_cog and not filter_cog.is_message_authorized(message):
                return

        await self.process_commands(message)

    async def process_commands(self, message: discord.Message):
        """Process commands supporting configured suffix without mutating message.content."""
        ctx = await self.get_context(message)
        if ctx.command is None and ctx.invoked_with:
            suffix = self.config.get("command_suffix", "")
            if suffix and ctx.invoked_with.endswith(suffix):
                real_name = ctx.invoked_with[:-len(suffix)]
                cmd = self.get_command(real_name)
                if cmd:
                    ctx.command = cmd
                    ctx.invoked_with = real_name

        await self.invoke(ctx)

    # --- Domain Service Helpers (Backwards-compatibility convenience) ---

    @property
    def locales(self):
        return self.i18n.locales

    @property
    def language_data(self):
        return self.i18n.default_language_data

    def is_bot_admin(self, member):
        return self.permissions.is_bot_admin(member)

    def is_master_admin(self, member):
        return self.permissions.is_master_admin(member)

    def is_master(self, guild_id):
        return self.entitlements.is_master(guild_id)

    def is_premium(self, guild_id):
        return self.entitlements.is_premium(guild_id)

    def get_guild_tier_limits(self, guild_id):
        return self.entitlements.get_guild_tier_limits(guild_id)

    def has_feature(self, guild_id, feature_name):
        return self.entitlements.has_feature(guild_id, feature_name)

    def get_guild_refresh_interval(self, guild_id):
        return self.entitlements.get_guild_refresh_interval(guild_id)

    def get_feedback(self, key, guild_id=None, force_lang=None, **kwargs):
        return self.i18n.get_feedback(key, guild_id=guild_id, force_lang=force_lang, **kwargs)

    def parse_emoji_text(self, text: str):
        return self.i18n.parse_emoji_text(text)

    def save_config(self):
        """Persist configuration to disk."""
        if hasattr(self.config, "save"):
            self.config.save("config.json")
            log.info("config.json saved to disk.")

    async def close(self):
        """Cleanup container and close gateway connection."""
        await self.container.shutdown()
        await super().close()

__all__ = ["FeedBot"]
