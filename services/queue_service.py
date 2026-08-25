import asyncio
import json
import time
from abc import ABC, abstractmethod
from logger import log

class BaseNotificationQueue(ABC):
    """Abstract notification queue interface for decoupled worker communication."""

    @abstractmethod
    async def push(self, task_data: dict, queue_name: str = "discord_notifications") -> bool:
        """Push a notification task payload into the named queue."""
        pass

    @abstractmethod
    async def pop(self, queue_name: str = "discord_notifications", timeout: float = 1.0) -> dict | None:
        """Pop the next notification task payload from the queue, or None if timed out."""
        pass

    @abstractmethod
    async def qsize(self, queue_name: str = "discord_notifications") -> int:
        """Return the current queue depth."""
        pass

class MemoryNotificationQueue(BaseNotificationQueue):
    """In-memory asynchronous queue for standalone mode, testing, and dev deployments."""

    def __init__(self):
        self._queues: dict[str, asyncio.Queue] = {}

    def _get_queue(self, queue_name: str) -> asyncio.Queue:
        if queue_name not in self._queues:
            self._queues[queue_name] = asyncio.Queue()
        return self._queues[queue_name]

    async def push(self, task_data: dict, queue_name: str = "discord_notifications") -> bool:
        q = self._get_queue(queue_name)
        await q.put(task_data)
        return True

    async def pop(self, queue_name: str = "discord_notifications", timeout: float = 1.0) -> dict | None:
        q = self._get_queue(queue_name)
        try:
            return await asyncio.wait_for(q.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None

    async def qsize(self, queue_name: str = "discord_notifications") -> int:
        return self._get_queue(queue_name).qsize()

class RedisNotificationQueue(BaseNotificationQueue):
    """Distributed Redis/Valkey queue for multi-process worker pools."""

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._redis = None
        self._fallback = MemoryNotificationQueue()

    async def _get_client(self):
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
            except Exception as e:
                log.warning(f"[RedisNotificationQueue] Redis client unavailable ({e}), using memory queue fallback.")
                return None
        return self._redis

    async def push(self, task_data: dict, queue_name: str = "discord_notifications") -> bool:
        client = await self._get_client()
        if client:
            try:
                serialized = json.dumps(task_data)
                await client.lpush(queue_name, serialized)
                return True
            except Exception as e:
                log.error(f"[RedisNotificationQueue] Push failed: {e}")
        return await self._fallback.push(task_data, queue_name)

    async def pop(self, queue_name: str = "discord_notifications", timeout: float = 1.0) -> dict | None:
        client = await self._get_client()
        if client:
            try:
                # BRPOP returns (key, value) or None
                timeout_int = max(1, int(timeout))
                res = await client.brpop(queue_name, timeout=timeout_int)
                if res and len(res) == 2:
                    return json.loads(res[1])
                return None
            except Exception as e:
                log.error(f"[RedisNotificationQueue] Pop failed: {e}")
        return await self._fallback.pop(queue_name, timeout)

    async def qsize(self, queue_name: str = "discord_notifications") -> int:
        client = await self._get_client()
        if client:
            try:
                return await client.llen(queue_name)
            except Exception:
                pass
        return await self._fallback.qsize(queue_name)

# Default shared queue instance
notification_queue: BaseNotificationQueue = MemoryNotificationQueue()

def get_notification_queue(redis_url: str | None = None) -> BaseNotificationQueue:
    """Factory to create appropriate queue instance based on configuration."""
    global notification_queue
    if redis_url and (redis_url.startswith("redis://") or redis_url.startswith("rediss://")):
        notification_queue = RedisNotificationQueue(redis_url)
    else:
        notification_queue = MemoryNotificationQueue()
    return notification_queue
