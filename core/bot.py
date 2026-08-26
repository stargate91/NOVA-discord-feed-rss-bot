import json
import os
import discord
from discord.ext import commands
from discord import app_commands
from logger import log
from db import guild_repo, monitor_repo, bot_settings_repo
from models import GuildSettings
from core.monitor_manager import MonitorManager
from core.monitor_factory import MonitorFactory
from engine.cache import BoundedGuildSettingsCache
from clients import http_client
from services import (
    LocalizationService,
    EntitlementService,
    PermissionService,
    CryptoService,
    DiscordDeliveryAdapter,
    NotificationService
)

class FeedBot(commands.Bot):
    def __init__(self, config):
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
        self.monitor_manager = None
        self.guild_settings_cache = BoundedGuildSettingsCache(max_size=5000)
        
        # Domain Services
        self.i18n = LocalizationService(self)
        self.entitlements = EntitlementService(self, config)
        self.permissions = PermissionService(self, config)
        self.crypto_service = CryptoService(self)
        self.delivery_adapter = DiscordDeliveryAdapter(self)
        self.notifications = NotificationService(self, self.delivery_adapter)

    async def reload_guild_settings_cache(self) -> bool:
        """Reload all guild settings from DB into the bounded LRU cache."""
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

    async def setup_hook(self):
        """Perform initialization tasks before the bot connects."""
        # Load localization files
        self.i18n.load_locales("locales")

        # Load all guild settings into memory
        await self.reload_guild_settings_cache()
        
        # Load Global Settings from DB
        p_interval = await bot_settings_repo.get_bot_setting("presence_interval_seconds")
        if p_interval:
            self.config["presence_interval_seconds"] = int(p_interval)
            
        r_interval = await bot_settings_repo.get_bot_setting("refresh_interval_minutes")
        if r_interval:
            self.config["refresh_interval_minutes"] = int(r_interval)
            
        a_channel = await bot_settings_repo.get_bot_setting("admin_channel_id")
        if a_channel:
            self.config["admin_channel_id"] = int(a_channel)

        self.monitor_manager = MonitorManager(self, self.config)
        
        # Load Cogs
        await self.load_all_extensions()

        # Start Crypto Service
        await self.crypto_service.start()

        # Load monitors from DB
        db_monitors = await monitor_repo.get_all_monitors()
        for m_config in db_monitors:
            monitor = MonitorFactory.create(self, m_config)
            if monitor:
                self.monitor_manager.add_monitor(monitor)
            else:
                log.warning(f"Unknown monitor type in DB: {m_config.get('type')}")

        # Start the background loop as a task
        self.monitor_task = self.loop.create_task(self.monitor_manager.start_loop())
        
        # Override Tree Error Handler for Slash Commands
        self.tree.on_error = self.on_app_command_error

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

    async def on_ready(self):
        log.info("--- FEED BOT ONLINE ---")
        log.info(f"Identity: {self.user} (ID: {self.user.id})")
        log.info(f"Prefix: {self.command_prefix}")
        log.info(f"Intents - Message Content: {self.intents.message_content}")
        log.info(f"Intents - Guild Messages: {self.intents.guild_messages}")
        log.info(f"Connected to {len(self.guilds)} guilds.")

        # Sync guilds with database
        log.info("Syncing guilds with database...")
        synced = 0
        for guild in self.guilds:
            try:
                # Ensure guild exists in database and mark as active
                await guild_repo.ensure_guild_active(guild.id)
                # If a new row was inserted or if we just want to ensure cache is warm
                if guild.id not in self.guild_settings_cache:
                    self.guild_settings_cache[guild.id] = GuildSettings(
                        guild_id=guild.id,
                        language="hu",
                        admin_role_id=0,
                        alert_templates={},
                        premium_until=None,
                        tier=0,
                        stripe_subscription_id=None
                    )
                    synced += 1
            except Exception as e:
                log.error(f"Error syncing guild {guild.id}: {e}")
        
        if synced > 0:
            log.info(f"Successfully synced {synced} new guilds to database.")
        
        log.info("------------------------")

    async def on_guild_join(self, guild):
        """Called when the bot joins a new guild."""
        log.info(f"Joined new guild: {guild.name} (ID: {guild.id})")
        try:
            # Ensure guild exists in database and mark as active
            await guild_repo.ensure_guild_active(guild.id)
            # Update local cache with default settings
            if guild.id not in self.guild_settings_cache:
                self.guild_settings_cache[guild.id] = GuildSettings(
                    guild_id=guild.id,
                    language="hu", # Default for new joins
                    admin_role_id=0,
                    alert_templates={},
                    premium_until=None,
                    tier=0,
                    stripe_subscription_id=None
                )
        except Exception as e:
            log.error(f"Error initializing guild settings for {guild.id}: {e}")

    async def on_guild_remove(self, guild):
        """Called when the bot is kicked from a guild."""
        log.info(f"Left guild: {guild.name} (ID: {guild.id})")
        
        try:
            await guild_repo.set_guild_inactive(guild.id)
            log.info(f"Marked guild {guild.id} as inactive in database.")
        except Exception as e:
            log.error(f"Error marking guild {guild.id} as inactive: {e}")

        if guild.id in self.guild_settings_cache:
            del self.guild_settings_cache[guild.id]

    async def on_message(self, message: discord.Message):
        """Process commands and enforce channel authorization constraints."""
        if message.author.bot:
            return

        prefix = self.command_prefix
        if message.content.startswith(prefix):
            master_guilds = self.config.get("master_guilds", {})
            if master_guilds and message.guild:
                guild_id_str = str(message.guild.id)
                if guild_id_str not in master_guilds:
                    log.info(f"Command ignored: Guild {guild_id_str} not in master_guilds list")
                    return

                admin_channel_id = master_guilds.get(guild_id_str, 0)
                if admin_channel_id != 0 and message.channel.id != admin_channel_id:
                    log.info(f"Command ignored: Channel {message.channel.id} is not the master admin channel ({admin_channel_id})")
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

    # --- Domain Service Delegates (Backwards-compatibility & convenience) ---

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

    async def on_error(self, event, *args, **kwargs):
        log.error(f"Global Event Error in '{event}':", exc_info=True)

    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.CommandNotFound):
            return
        log.error(f"Prefix Command Error in '{ctx.command}': {error}", exc_info=True)
        await ctx.send(self.get_feedback("error_prefix_msg", error=error, guild_id=ctx.guild.id if ctx.guild else 0), delete_after=10)

    async def on_app_command_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        log.error(f"Slash Command Error in '/{interaction.command.name if interaction.command else 'unknown'}': {error}", exc_info=True, extra={'guild_id': interaction.guild_id or 0})
        
        msg = self.get_feedback("error_unexpected", guild_id=interaction.guild_id or 0)
        if interaction.response.is_done():
            await interaction.followup.send(msg, ephemeral=True)
        else:
            await interaction.response.send_message(msg, ephemeral=True)

    def save_config(self):
        """Persist config.json to disk."""
        save_config = self.config.copy()
        for key in ("token", "database_path", "refresh_interval_minutes", "presence_interval_seconds", "monitors", "admin_channel_id"):
            save_config.pop(key, None)
        with open("config.json", "w", encoding="utf-8") as f:
            json.dump(save_config, f, indent=4, ensure_ascii=False)
        log.info("config.json saved to disk.")

    async def close(self):
        """Cleanup before shutdown."""
        if hasattr(self, 'crypto_service') and self.crypto_service:
            await self.crypto_service.stop()
        await http_client.close()
        await super().close()

__all__ = ["FeedBot"]
