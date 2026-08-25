import asyncio
import aiohttp
from logger import log

DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

class HttpClient:
    """
    Central HTTP client with TCP connection pooling, DNS caching,
    default User-Agent, timeouts, and exponential retry logic.
    """

    def __init__(
        self,
        user_agent: str = DEFAULT_USER_AGENT,
        default_timeout: int = 15,
        pool_limit: int = 100,
        pool_limit_per_host: int = 15,
        dns_cache_ttl: int = 300
    ):
        self.user_agent = user_agent
        self.default_timeout = default_timeout
        self.pool_limit = pool_limit
        self.pool_limit_per_host = pool_limit_per_host
        self.dns_cache_ttl = dns_cache_ttl
        self._session: aiohttp.ClientSession | None = None

    async def get_session(self) -> aiohttp.ClientSession:
        """Retrieve or initialize the shared aiohttp ClientSession with TCPConnector pooling."""
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(
                limit=self.pool_limit,
                limit_per_host=self.pool_limit_per_host,
                ttl_dns_cache=self.dns_cache_ttl,
                enable_cleanup_closed=True
            )
            timeout = aiohttp.ClientTimeout(total=self.default_timeout)
            headers = {"User-Agent": self.user_agent}
            self._session = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout,
                headers=headers
            )
        return self._session

    async def get_json(
        self,
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        timeout: int | None = None,
        retries: int = 2
    ) -> dict | list | None:
        """Fetch JSON data from a URL with automatic retries on transient errors."""
        session = await self.get_session()
        custom_timeout = aiohttp.ClientTimeout(total=timeout) if timeout else None

        for attempt in range(retries + 1):
            try:
                async with session.get(url, headers=headers, params=params, timeout=custom_timeout) as resp:
                    if resp.status in (200, 201):
                        return await resp.json()
                    elif resp.status in (500, 502, 503, 504) and attempt < retries:
                        log.warning(f"[HttpClient] HTTP {resp.status} for {url}. Retrying ({attempt + 1}/{retries})...")
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    else:
                        log.error(f"[HttpClient] HTTP {resp.status} from {url}")
                        return None
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                if attempt < retries:
                    log.warning(f"[HttpClient] Network error for {url}: {e}. Retrying ({attempt + 1}/{retries})...")
                    await asyncio.sleep(1 * (attempt + 1))
                    continue
                log.error(f"[HttpClient] Failed to fetch {url} after {retries + 1} attempts: {e}")
                return None
            except Exception as e:
                log.error(f"[HttpClient] Unexpected error fetching {url}: {e}", exc_info=True)
                return None
        return None

    async def get_text(
        self,
        url: str,
        headers: dict | None = None,
        params: dict | None = None,
        timeout: int | None = None,
        retries: int = 2
    ) -> str | None:
        """Fetch plain text data from a URL with automatic retries."""
        session = await self.get_session()
        custom_timeout = aiohttp.ClientTimeout(total=timeout) if timeout else None

        for attempt in range(retries + 1):
            try:
                async with session.get(url, headers=headers, params=params, timeout=custom_timeout) as resp:
                    if resp.status in (200, 201):
                        return await resp.text()
                    elif resp.status in (500, 502, 503, 504) and attempt < retries:
                        await asyncio.sleep(1 * (attempt + 1))
                        continue
                    else:
                        log.error(f"[HttpClient] HTTP {resp.status} from {url}")
                        return None
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                if attempt < retries:
                    await asyncio.sleep(1 * (attempt + 1))
                    continue
                log.error(f"[HttpClient] Failed to fetch {url}: {e}")
                return None
            except Exception as e:
                log.error(f"[HttpClient] Unexpected error fetching {url}: {e}", exc_info=True)
                return None
        return None

    async def close(self):
        """Close the underlying aiohttp session and connector pool."""
        if self._session and not self._session.closed:
            await self._session.close()
            self._session = None

# Shared singleton instance
http_client = HttpClient()
