from clients import http_client
from logger import log

class CoinGeckoClient:
    """Provider client for CoinGecko cryptocurrency prices and coin listing."""

    BASE_URL = "https://api.coingecko.com/api/v3"

    async def fetch_prices(self, coin_ids: list[str]) -> dict[str, float]:
        """Fetch current USD prices for a list of cryptocurrency IDs."""
        valid_ids = [cid for cid in coin_ids if cid]
        if not valid_ids:
            return {}

        ids_str = ",".join(sorted(list(set(valid_ids))))
        url = f"{self.BASE_URL}/simple/price?ids={ids_str}&vs_currencies=usd"

        try:
            data = await http_client.get_json(url)
            if not data or not isinstance(data, dict):
                return {}

            prices = {}
            for cid, val in data.items():
                if isinstance(val, dict) and "usd" in val:
                    prices[cid] = float(val["usd"])

            return prices
        except Exception as e:
            log.error(f"[CoinGeckoClient] Error fetching prices: {e}")
            return {}

    async def fetch_coin_list(self) -> list[dict]:
        """Fetch the full list of supported coins from CoinGecko."""
        url = f"{self.BASE_URL}/coins/list"
        try:
            data = await http_client.get_json(url)
            return data if isinstance(data, list) else []
        except Exception as e:
            log.error(f"[CoinGeckoClient] Error fetching coin list: {e}")
            return []
