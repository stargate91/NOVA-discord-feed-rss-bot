import discord
from discord.ext import commands
from discord import app_commands
from logger import log

class ErrorHandlerCog(commands.Cog, name="error_handler"):
    """Centralized error handling for Discord prefix commands, slash commands, and global events."""

    def __init__(self, bot):
        self.bot = bot
        # Register tree app command error handler
        if hasattr(self.bot, "tree"):
            self.bot.tree.on_error = self.on_app_command_error

    @commands.Cog.listener()
    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        """Global prefix command error handler."""
        if isinstance(error, commands.CommandNotFound):
            return

        log.error(f"Prefix Command Error in '{ctx.command}': {error}", exc_info=True)
        guild_id = ctx.guild.id if ctx.guild else 0
        msg = self.bot.get_feedback("error_prefix_msg", error=error, guild_id=guild_id)
        await ctx.send(msg, delete_after=10)

    async def on_app_command_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        """Global slash command error handler."""
        cmd_name = interaction.command.name if interaction.command else "unknown"
        guild_id = interaction.guild_id or 0
        log.error(f"Slash Command Error in '/{cmd_name}': {error}", exc_info=True, extra={'guild_id': guild_id})

        msg = self.bot.get_feedback("error_unexpected", guild_id=guild_id)
        if interaction.response.is_done():
            await interaction.followup.send(msg, ephemeral=True)
        else:
            await interaction.response.send_message(msg, ephemeral=True)

    @commands.Cog.listener()
    async def on_error(self, event: str, *args, **kwargs):
        """Global Discord gateway event error logger."""
        log.error(f"Global Event Error in '{event}':", exc_info=True)

async def setup(bot):
    await bot.add_cog(ErrorHandlerCog(bot))
