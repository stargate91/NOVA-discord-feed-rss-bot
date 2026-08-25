import discord
from ui.components.branding import append_branding
from ui.components.media import append_media_gallery

# Platform emoji mapping for streams
STREAM_EMOJIS = {
    "twitch": "<:twitch:1495846084352934139>",
    "kick": "<:kick:1498048392335724664>",
}

def generate_youtube_layout(
    bot,
    guild_id: int,
    alert_text: str,
    title: str,
    url: str,
    image_url: str,
    author: str,
    published_ts: int,
    accent_color: int
):
    """
    Centralized generator for YouTube feeds using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n<{url}>"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Main Title
    container_items.append(discord.ui.TextDisplay(f"### <:youtube:1495845103447576807> {title}"))

    # 2. Thumbnail
    append_media_gallery(container_items, image_url)

    # 3. Meta Section
    btn_label = bot.get_feedback("btn_view_youtube", guild_id=guild_id)
    button = discord.ui.Button(label=btn_label, url=url, style=discord.ButtonStyle.link)

    meta_lines = []
    if author:
        meta_lines.append(f"**{author}**")
    if published_ts:
        meta_lines.append(f"**{bot.get_feedback('field_published_at', guild_id=guild_id)}:**\n<t:{published_ts}:f> (<t:{published_ts}:R>)")

    meta_text = "\n".join(meta_lines)
    if meta_text:
        container_items.append(
            discord.ui.Section(discord.ui.TextDisplay(meta_text), accessory=button)
        )
    else:
        container_items.append(
            discord.ui.Section(discord.ui.TextDisplay(f"🔗 **{btn_label}**"), accessory=button)
        )

    # 4. Branding
    append_branding(container_items, bot, guild_id)

    container = discord.ui.Container(*container_items, accent_color=accent_color)
    layout.add_item(container)

    return content, layout

def generate_tmdb_layout(
    bot,
    guild_id: int,
    alert_text: str,
    title: str,
    url: str,
    backdrop_url: str,
    poster_url: str,
    score_text: str,
    genre_text: str,
    release_date: str,
    trailer_url: str,
    accent_color: int
):
    """
    Centralized generator for TMDb Movie/TV feeds using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{url}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Title at the top
    container_items.append(discord.ui.TextDisplay(f"### <:tmdb:1495845178945044590> {title}"))

    # 2. Backdrop (wide 16:9 hero image)
    append_media_gallery(container_items, backdrop_url)

    # 3. Meta info section
    score_label = bot.get_feedback("field_score", guild_id=guild_id)
    date_label = bot.get_feedback("field_release_date", guild_id=guild_id)

    meta_lines = []
    if genre_text:
        meta_lines.append(f"**{genre_text}**")
    if score_text:
        meta_lines.append(f"{score_label}: {score_text}")
    if release_date:
        meta_lines.append(f"{date_label}: {release_date}")

    meta_text = "\n".join(meta_lines) if meta_lines else f"**{title}**"
    container_items.append(discord.ui.TextDisplay(meta_text))

    # 4. Buttons in ActionRow
    btn_label = bot.get_feedback("btn_view_tmdb", guild_id=guild_id)
    action_row = discord.ui.ActionRow()
    action_row.add_item(discord.ui.Button(label=btn_label, url=url, style=discord.ButtonStyle.link))
    if trailer_url:
        t_label, t_emoji = bot.parse_emoji_text(bot.get_feedback("btn_watch_trailer", guild_id=guild_id))
        action_row.add_item(discord.ui.Button(label=t_label, emoji=t_emoji, url=trailer_url, style=discord.ButtonStyle.link))
    container_items.append(action_row)

    # 5. Branding
    append_branding(container_items, bot, guild_id)

    container = discord.ui.Container(*container_items, accent_color=accent_color)
    layout.add_item(container)

    return content, layout

def generate_stream_layout(
    bot,
    guild_id: int,
    alert_text: str,
    display_name: str,
    title: str,
    url: str,
    thumbnail_url: str,
    profile_image_url: str,
    game: str,
    viewers: int,
    platform: str,
    accent_color: int
):
    """
    Centralized generator for Twitch/Kick stream notifications using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{url}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Platform emoji + LIVE
    platform_emoji = STREAM_EMOJIS.get(platform, "")
    container_items.append(discord.ui.TextDisplay(f"### {platform_emoji} {display_name} • LIVE"))

    # 2. Stream title
    if title:
        container_items.append(discord.ui.TextDisplay(title))

    # 3. Stream thumbnail
    append_media_gallery(container_items, thumbnail_url)

    # 4. Meta Section
    na_text = bot.get_feedback("default_unknown", guild_id=guild_id)
    game_label = bot.get_feedback("field_game", guild_id=guild_id)
    viewers_label = bot.get_feedback("field_viewers", guild_id=guild_id)

    meta_lines = []
    if game and game != na_text:
        meta_lines.append(f"**{game_label}:** {game}")
    if viewers:
        meta_lines.append(f"**{viewers_label}:** {viewers:,}")

    meta_text = "\n".join(meta_lines) if meta_lines else f"**{display_name}**"
    btn_label = bot.get_feedback("btn_view_stream", guild_id=guild_id)
    button = discord.ui.Button(label=btn_label, url=url, style=discord.ButtonStyle.link)

    container_items.append(
        discord.ui.Section(discord.ui.TextDisplay(meta_text), accessory=button)
    )

    # 5. Branding
    append_branding(container_items, bot, guild_id)

    container = discord.ui.Container(*container_items, accent_color=accent_color)
    layout.add_item(container)

    return content, layout

def generate_steam_news_layout(
    bot,
    guild_id: int,
    alert_text: str,
    title: str,
    url: str,
    description: str,
    image_url: str,
    author: str,
    published_ts: int,
    accent_color: int
):
    """
    Centralized generator for Steam News feeds using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{url}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Main Title with Steam emoji
    formatted_title_lines = []
    for i, line in enumerate(title.split('\n')):
        if i == 0:
            formatted_title_lines.append(f"### <:steam:1490131413956038656> {line}")
        else:
            formatted_title_lines.append(f"### {line}")

    container_items.append(discord.ui.TextDisplay("\n".join(formatted_title_lines)))

    # 2. Image (Thumbnail/Cover)
    append_media_gallery(container_items, image_url)

    # 3. Description
    if description:
        container_items.append(discord.ui.TextDisplay(description))

    # 4. Meta Section
    meta_lines = []
    if author:
        meta_lines.append(f"**{author}**")
    if published_ts:
        meta_lines.append(f"**{bot.get_feedback('field_published_at', guild_id=guild_id)}:** <t:{published_ts}:f> (<t:{published_ts}:R>)")

    meta_text = "\n".join(meta_lines)
    btn_label = bot.get_feedback("btn_read_more", guild_id=guild_id)
    button = discord.ui.Button(label=btn_label, url=url, style=discord.ButtonStyle.link)

    if meta_text:
        container_items.append(
            discord.ui.Section(discord.ui.TextDisplay(meta_text), accessory=button)
        )
    else:
        container_items.append(
            discord.ui.Section(discord.ui.TextDisplay(f"**{btn_label}**"), accessory=button)
        )

    # 5. Branding
    append_branding(container_items, bot, guild_id)

    container = discord.ui.Container(*container_items, accent_color=accent_color)
    layout.add_item(container)

    return content, layout
