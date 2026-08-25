import discord
from ui.components.branding import append_branding
from ui.components.media import append_media_gallery

def generate_news_layout(
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
    Centralized generator for News/RSS feeds using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{url}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Main Title
    container_items.append(discord.ui.TextDisplay(f"### {title}"))

    # 2. Image (if present)
    append_media_gallery(container_items, image_url)

    # 3. Meta Section
    btn_label = bot.get_feedback("btn_read_more", guild_id=guild_id)
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

def generate_github_layout(
    bot,
    guild_id: int,
    alert_text: str,
    repo_name: str,
    title: str,
    url: str,
    description: str,
    author: str,
    published_ts: int,
    accent_color: int,
    image_url: str = None
):
    """
    Centralized generator for GitHub Release feeds using Discord Components V2.
    Returns (content, view).
    """
    content = f"{alert_text}\n{url}"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Main Title with GitHub emoji
    formatted_title_lines = []
    for i, line in enumerate(title.split('\n')):
        if i == 0:
            formatted_title_lines.append(f"### <:gitgub:1495845732874321980> {repo_name} - {line}")
        else:
            formatted_title_lines.append(f"### {line}")

    container_items.append(discord.ui.TextDisplay("\n".join(formatted_title_lines)))

    # 2. Image (if present)
    append_media_gallery(container_items, image_url)

    # 3. Description (excerpt)
    if description:
        container_items.append(discord.ui.TextDisplay(description))

    # 4. Meta Section
    meta_lines = []
    if author and author != "Unknown":
        meta_lines.append(f"**{author}**")
    if published_ts:
        meta_lines.append(f"**{bot.get_feedback('field_published_at', guild_id=guild_id)}:** <t:{published_ts}:f> (<t:{published_ts}:R>)")

    meta_text = "\n".join(meta_lines)
    btn_label = bot.get_feedback("btn_view_github", guild_id=guild_id)
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
