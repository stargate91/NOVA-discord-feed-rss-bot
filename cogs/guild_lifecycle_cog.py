import discord
from discord.ext import commands
from logger import log
from db import guild_repo
from models import GuildSettings

class GuildLifecycleCog(commands.Cog, name="guild_lifecycle"):
    """Manages guild synchronization, join/leave events, and database lifecycle."""

    def __init__(self, bot):
        self.bot = bot

    async def on_ready(self):
        """Sync guilds with database on gateway ready event."""
        log.info("--- FEED BOT ONLINE ---")
        log.info(f"Identity: {self.bot.user} (ID: {self.bot.user.id})")
        log.info(f"Prefix: {self.bot.command_prefix}")
        log.info(f"Intents - Message Content: {self.bot.intents.message_content}")
        log.info(f"Intents - Guild Messages: {self.bot.intents.guild_messages}")
        log.info(f"Connected to {len(self.bot.guilds)} guilds.")

        # Sync guilds with database
        log.info("Syncing guilds with database...")
        synced = 0
        cache = self.bot.guild_settings_cache
        default_lang = getattr(self.bot.config, "default_language", "en") if hasattr(self.bot, "config") else "en"

        for guild in self.bot.guilds:
            try:
                await guild_repo.ensure_guild_active(guild.id)
                if guild.id not in cache:
                    cache[guild.id] = GuildSettings(
                        guild_id=guild.id,
                        language=default_lang,
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

    async def on_guild_join(self, guild: discord.Guild):
        """Called when the bot joins a new guild."""
        log.info(f"Joined new guild: {guild.name} (ID: {guild.id})")
        default_lang = getattr(self.bot.config, "default_language", "en") if hasattr(self.bot, "config") else "en"
        try:
            await guild_repo.ensure_guild_active(guild.id)
            if guild.id not in self.bot.guild_settings_cache:
                self.bot.guild_settings_cache[guild.id] = GuildSettings(
                    guild_id=guild.id,
                    language=default_lang,
                    admin_role_id=0,
                    alert_templates={},
                    premium_until=None,
                    tier=0,
                    stripe_subscription_id=None
                )
        except Exception as e:
            log.error(f"Error initializing guild settings for {guild.id}: {e}")

    async def on_guild_remove(self, guild: discord.Guild):
        """Called when the bot is removed from a guild."""
        log.info(f"Left guild: {guild.name} (ID: {guild.id})")
        try:
            await guild_repo.set_guild_inactive(guild.id)
            log.info(f"Marked guild {guild.id} as inactive in database.")
        except Exception as e:
            log.error(f"Error marking guild {guild.id} as inactive: {e}")

        if guild.id in self.bot.guild_settings_cache:
            del self.bot.guild_settings_cache[guild.id]

async def setup(bot):
    await bot.add_cog(GuildLifecycleCog(bot))
