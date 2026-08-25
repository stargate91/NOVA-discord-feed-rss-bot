from fastapi import APIRouter, Depends
from api.dependencies import get_bot, verify_webhook_secret

router = APIRouter(tags=["Guilds"])

@router.get("/guilds/{guild_id}/permissions/{user_id}")
async def get_permissions(
    guild_id: int,
    user_id: int,
    bot = Depends(get_bot),
    authorized: bool = Depends(verify_webhook_secret)
):
    """Retrieve user administrative permissions and guild tier info for dashboard."""
    guild = bot.get_guild(guild_id)

    # 1. Base Tier Info (from DB / cache)
    settings = bot.guild_settings_cache.get(guild_id, {})
    tier = settings.get("tier", 0)
    if tier == 0 and bot.is_premium(guild_id):
        tier = 3

    tier_config_all = bot.config.get("tier_config", {})
    tier_info = tier_config_all.get(str(tier), tier_config_all.get("0", {}))

    # 2. Member Permissions (Requires bot in guild)
    is_admin = False
    bot_in_guild = False

    if guild:
        bot_in_guild = True
        member = guild.get_member(user_id)
        if not member:
            try:
                member = await guild.fetch_member(user_id)
            except Exception:
                member = None

        if member:
            is_admin = bot.is_bot_admin(member)

    return {
        "is_admin": is_admin,
        "tier": tier,
        "tier_name": tier_info.get("name", "Unknown"),
        "features": tier_info.get("features", []),
        "limits": tier_info,
        "bot_in_guild": bot_in_guild
    }
