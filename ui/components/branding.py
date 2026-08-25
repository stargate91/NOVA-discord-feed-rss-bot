import discord

def append_branding(container_items: list, bot, guild_id: int):
    """
    Appends a Discord Components V2 Separator and Branding footer
    based on the guild's custom branding setting.
    """
    settings = {}
    if bot and hasattr(bot, "guild_settings_cache"):
        settings = bot.guild_settings_cache.get(guild_id, {})

    custom_branding = settings.get("custom_branding")

    if custom_branding == "":
        # Explicitly disabled branding
        return

    container_items.append(discord.ui.Separator())

    if custom_branding:
        container_items.append(discord.ui.TextDisplay(custom_branding))
    else:
        branding_text = bot.get_feedback("branding_delivered_by", guild_id=guild_id) if bot else "Delivered by Nova"
        container_items.append(discord.ui.TextDisplay(branding_text))
