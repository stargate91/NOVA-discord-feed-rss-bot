class PermissionService:
    """Service responsible for validating bot and staff administrative permissions."""

    def __init__(self, bot=None, config: dict | None = None):
        self.bot = bot
        self._config = config or {}

    @property
    def config(self) -> dict:
        if self.bot and hasattr(self.bot, "config"):
            return self.bot.config
        return self._config

    def is_master_admin(self, member_or_user) -> bool:
        """Check if a user is a Master Admin (Bot Owner OR configured Master User ID)."""
        if not member_or_user:
            return False

        # 1. Global Discord Bot Owner
        if self.bot:
            if hasattr(self.bot, "owner_id") and member_or_user.id == self.bot.owner_id:
                return True
            if hasattr(self.bot, "application") and self.bot.application and hasattr(self.bot.application, "owner"):
                if self.bot.application.owner and member_or_user.id == self.bot.application.owner.id:
                    return True

        # 2. Configured Master User IDs
        master_user_ids = self.config.get("master_user_ids", [])
        if member_or_user.id in master_user_ids:
            return True

        return False

    def is_bot_admin(self, member) -> bool:
        """Check if a member is a bot admin based on Discord permissions or configured Admin Role."""
        if not member or not hasattr(member, 'guild'):
            return False

        # 1. Global Master/Staff
        if self.is_master_admin(member):
            return True

        # 2. Discord Permissions from Config
        perms = member.guild_permissions
        perm_config = self.config.get("permission_config", {})
        allowed_perms = perm_config.get("admin_permissions", ["administrator", "manage_guild"])

        for perm in allowed_perms:
            if getattr(perms, perm, False):
                return True

        # 3. Check for configured Admin Role
        if perm_config.get("admin_role_enabled", True):
            settings = {}
            if self.bot and hasattr(self.bot, "guild_settings_cache"):
                settings = self.bot.guild_settings_cache.get(member.guild.id, {})
            admin_role_id = settings.get("admin_role_id", 0)
            if admin_role_id != 0:
                role = member.get_role(admin_role_id)
                if role and role in member.roles:
                    return True

        return False
