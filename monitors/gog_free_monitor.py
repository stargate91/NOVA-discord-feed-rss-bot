from monitors.base_game_monitor import BaseGameGiveawayMonitor

class GOGFreeMonitor(BaseGameGiveawayMonitor):
    """Monitor for free GOG game giveaways via GamerPower API."""

    def __init__(self, bot, config):
        super().__init__(
            bot=bot,
            config=config,
            platform_name="GOG",
            platform_emoji="<:gog:1490131412043431976>",
            gamerpower_platform="gog"
        )
        self.api_url = "https://www.gamerpower.com/api/giveaways?platform=gog&sort-by=date"
