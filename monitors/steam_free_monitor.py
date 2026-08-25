from monitors.base_game_monitor import BaseGameGiveawayMonitor

class SteamFreeMonitor(BaseGameGiveawayMonitor):
    """Monitor for free Steam game giveaways via GamerPower API."""

    def __init__(self, bot, config):
        super().__init__(
            bot=bot,
            config=config,
            platform_name="Steam",
            platform_emoji="<:steam:1490131413956038656>",
            gamerpower_platform="steam"
        )
        self.include_dlc = config.get("include_dlc", False)
        self.api_url = "https://www.gamerpower.com/api/giveaways?platform=steam&sort-by=date"
