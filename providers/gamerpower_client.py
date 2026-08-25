from clients import http_client
from logger import log

class GamerPowerClient:
    """Provider client for GamerPower free game giveaways (Steam, GOG, Epic)."""

    BASE_URL = "https://www.gamerpower.com/api/giveaways"

    async def fetch_giveaways(self, platform: str = "steam") -> list[dict]:
        """Fetch active giveaways for the specified platform from GamerPower."""
        url = f"{self.BASE_URL}?platform={platform}&sort-by=date"
        try:
            data = await http_client.get_json(url)
            if not data:
                return []

            # GamerPower returns {"status": 0, "status_message": "..."} when no giveaways exist
            if isinstance(data, dict) and data.get("status") == 0:
                return []

            if isinstance(data, list):
                return data

            return []
        except Exception as e:
            log.error(f"[GamerPowerClient] Error fetching giveaways for {platform}: {e}")
            return []
