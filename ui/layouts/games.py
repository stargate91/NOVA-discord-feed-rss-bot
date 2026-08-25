import discord
from ui.components.branding import append_branding
from ui.components.media import append_media_gallery

def generate_free_game_layout(
    bot,
    guild_id: int,
    alert_text: str,
    title: str,
    game_url: str,
    image_url: str,
    worth: str,
    giveaway_type: str,
    expiry_ts: int,
    accent_color: int
):
    """
    Centralized generator for Free Game giveaways using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{game_url}"

    lines = []
    na_text = bot.get_feedback("default_na", guild_id=guild_id)

    if worth and worth != na_text and worth != "0":
        lines.append(f"**{bot.get_feedback('field_worth', guild_id=guild_id)}:** ~~{worth}~~ **FREE**")

    if giveaway_type and giveaway_type != "Game":
        lines.append(f"**{bot.get_feedback('field_type', guild_id=guild_id)}:** {giveaway_type}")

    if expiry_ts:
        lines.append(f"**{bot.get_feedback('field_expiry', guild_id=guild_id)}:** <t:{expiry_ts}:R>")

    desc_text = "\n".join(lines)
    section_text = f"### {title}\n{desc_text}" if desc_text else f"### {title}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Top Wide Image (if any)
    append_media_gallery(container_items, image_url)

    # 2. Text Section with Link Button on the right
    btn_label = bot.get_feedback("btn_get_game", guild_id=guild_id)
    section = discord.ui.Section(
        discord.ui.TextDisplay(section_text),
        accessory=discord.ui.Button(label=btn_label, url=game_url, style=discord.ButtonStyle.link)
    )
    container_items.append(section)

    # 3. Branding
    append_branding(container_items, bot, guild_id)

    container = discord.ui.Container(*container_items, accent_color=accent_color)
    layout.add_item(container)

    return content, layout
