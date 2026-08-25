import os
import json
import asyncio
import time
from logger import log
from providers.coingecko_client import CoinGeckoClient

class CryptoService:
    """
    Centralized service for managing cryptocurrency price updates, symbol mappings, and caching.
    """

    def __init__(self, bot=None, cache_dir: str = "data"):
        self.bot = bot
        self.cache_dir = cache_dir
        self.cache_file = os.path.join(self.cache_dir, "coingecko_coins.json")
        self.client = CoinGeckoClient()

        self._prices: dict[str, dict] = {}  # {coin_id: {"usd": price, "last_updated": ts}}
        self._tracked_ids: set[str] = set()
        self._coin_id_map: dict[str, str] = {}
        self._running = False
        self._task: asyncio.Task | None = None
        self._interval = 60  # Fetch every 60 seconds

    def register_coins(self, coin_ids: list[str]):
        """Register coin IDs for periodic background price tracking."""
        for cid in coin_ids:
            if cid:
                self._tracked_ids.add(cid)

    def get_price_data(self, coin_id: str) -> dict | None:
        """Returns the cached price data for a given coin ID."""
        return self._prices.get(coin_id)

    async def start(self):
        """Start the background price polling loop."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())
        log.info("CryptoService started.")

    async def stop(self):
        """Stop the background price polling loop."""
        self._running = False
        if self._task:
            self._task.cancel()
        log.info("CryptoService stopped.")

    async def _loop(self):
        while self._running:
            try:
                if self._tracked_ids:
                    await self._fetch_prices()
            except Exception as e:
                log.error(f"[CryptoService] Error in fetch loop: {e}")

            await asyncio.sleep(self._interval)

    async def _fetch_prices(self):
        prices_data = await self.client.fetch_prices(list(self._tracked_ids))
        if prices_data:
            now = time.time()
            for cid, price in prices_data.items():
                self._prices[cid] = {
                    "usd": price,
                    "last_updated": now
                }

    async def get_coin_map(self) -> dict[str, str]:
        """Fetch or load cached symbol-to-CoinGecko ID mapping."""
        if self._coin_id_map:
            return self._coin_id_map

        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

        # 24-hour cache
        if os.path.exists(self.cache_file):
            file_age = time.time() - os.path.getmtime(self.cache_file)
            if file_age < 86400:
                try:
                    with open(self.cache_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        self._coin_id_map = self._process_coin_list(data)
                        return self._coin_id_map
                except Exception as e:
                    log.error(f"[CryptoService] Error reading coin cache: {e}")

        log.info("[CryptoService] Fetching fresh coin list from CoinGecko...")
        data = await self.client.fetch_coin_list()
        if data:
            try:
                with open(self.cache_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f)
            except Exception as e:
                log.error(f"[CryptoService] Error saving coin cache: {e}")

            self._coin_id_map = self._process_coin_list(data)

        return self._coin_id_map

    def _process_coin_list(self, data: list[dict]) -> dict[str, str]:
        priority_mismatch = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "SOL": "solana",
            "ADA": "cardano",
            "DOT": "polkadot",
            "XRP": "ripple",
            "DOGE": "dogecoin",
            "BNB": "binancecoin"
        }

        mapping = {}
        for coin in data:
            sym = coin.get("symbol", "").upper()
            cid = coin.get("id")
            if not sym or not cid:
                continue

            if sym not in mapping or len(cid) < len(mapping[sym]):
                mapping[sym] = cid

        for sym, cid in priority_mismatch.items():
            mapping[sym] = cid

        return mapping
