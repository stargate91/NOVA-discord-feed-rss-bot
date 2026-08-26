import discord
from discord.ext import commands
from logger import log

class CommandFilterCog(commands.Cog, name="command_filter"):
    """Enforces master guild channel authorization and message filtering."""

    def __init__(self, bot):
        self.bot = bot

    def is_message_authorized(self, message: discord.Message) -> bool:
        """Check if message originating in a guild satisfies master guild channel restrictions."""
        if not message.guild:
            return True

        master_guilds = self.bot.config.get("master_guilds", {})
        if not master_guilds:
            return True

        guild_id_str = str(message.guild.id)
        if guild_id_str not in master_guilds:
            log.debug(f"Command ignored: Guild {guild_id_str} not in master_guilds list")
            return False

        admin_channel_id = master_guilds.get(guild_id_str, 0)
        if admin_channel_id != 0 and message.channel.id != admin_channel_id:
            log.debug(f"Command ignored: Channel {message.channel.id} is not the master admin channel ({admin_channel_id})")
            return False

        return True

async def setup(bot):
    await bot.add_cog(CommandFilterCog(bot))
