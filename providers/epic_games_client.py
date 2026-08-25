from clients import http_client
from logger import log

class EpicGamesClient:
    """Provider client for Epic Games Store free game promotions."""

    BASE_URL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions"

    async def fetch_promotions(self, locale: str = "hu-HU", country: str = "HU") -> list[dict]:
        """Fetch active and upcoming promotional elements from Epic Games Store."""
        url = f"{self.BASE_URL}?locale={locale}&country={country}&allowCountries={country}"
        try:
            data = await http_client.get_json(url)
            if not data or not isinstance(data, dict):
                return []

            elements = data.get("data", {}).get("Catalog", {}).get("searchStore", {}).get("elements", [])
            return elements if isinstance(elements, list) else []
        except Exception as e:
            log.error(f"[EpicGamesClient] Error fetching promotions: {e}")
            return []
