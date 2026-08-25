import discord

def generate_dashboard_layout(bot, guild_id: int):
    """
    Generates a premium Discord Components V2 layout for the /dashboard command.
    """
    title = bot.get_feedback("dashboard_cmd_title", guild_id=guild_id)
    desc = bot.get_feedback("dashboard_cmd_desc", guild_id=guild_id)

    db_text = bot.get_feedback("btn_web_dashboard", guild_id=guild_id)
    sup_text = bot.get_feedback("btn_support_server", guild_id=guild_id)

    db_label, _ = bot.parse_emoji_text(db_text)
    sup_label, _ = bot.parse_emoji_text(sup_text)

    db_emoji = "<:webcolorful:1498074998953476206>"
    sup_emoji = "<:discord:1498075023871709224>"

    layout = discord.ui.LayoutView()
    container_items = []

    # 1. Main Section (Title + Description + Thumbnail)
    bot_avatar = bot.user.display_avatar.url if (bot and bot.user) else None

    clean_desc = desc.replace("\n\n", "\n")
    combined_text = f"### {title}\n{clean_desc}"

    accessory = discord.ui.Thumbnail(bot_avatar) if bot_avatar else None
    main_section = discord.ui.Section(
        discord.ui.TextDisplay(combined_text),
        accessory=accessory
    )
    container_items.append(main_section)

    # 2. Action Buttons
    btn_db = discord.ui.Button(label=db_label, emoji=db_emoji, url="https://novafeeds.xyz", style=discord.ButtonStyle.link)
    btn_sup = discord.ui.Button(label=sup_label, emoji=sup_emoji, url="https://discord.gg/novafeeds", style=discord.ButtonStyle.link)

    container_items.append(discord.ui.Separator())
    container_items.append(discord.ui.ActionRow(btn_db, btn_sup))

    container = discord.ui.Container(*container_items, accent_color=0x2b2d31)
    layout.add_item(container)

    return layout
