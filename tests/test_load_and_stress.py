import asyncio
import unittest
from unittest.mock import MagicMock
from engine.cache import SharedDataCache, BoundedGuildSettingsCache
from engine.scheduler import PollingScheduler
from engine.pipeline import FeedPipeline
from services.queue_service import MemoryNotificationQueue
from models.guild import GuildSettings

class TestLoadAndStress(unittest.IsolatedAsyncioTestCase):
    """
    Load & Stress test suite for Nova under high concurrency and high data volume.
    """

    async def test_bounded_cache_high_concurrency_stress(self):
        """Stress test BoundedGuildSettingsCache under 2,000 concurrent insertions and lookups."""
        cache = BoundedGuildSettingsCache(max_size=500)

        async def worker_task(worker_id: int):
            for i in range(100):
                guild_id = (worker_id * 100) + i
                cache[guild_id] = GuildSettings(guild_id=guild_id, tier=i % 4)
                _ = cache.get(guild_id)

        tasks = [worker_task(w) for w in range(20)]
        await asyncio.gather(*tasks)

        # Cache must strictly stay within bounds
        self.assertLessEqual(len(cache), 500)
        self.assertEqual(cache.max_size, 500)

    async def test_shared_cache_throughput_and_eviction_stress(self):
        """Stress test SharedDataCache with 1,000 items with opportunistic auto-cleanup."""
        shared = SharedDataCache(default_ttl=1, max_size=200)

        for i in range(500):
            shared.set_shared_data(f"feed_key_{i}", {"content": f"data_{i}"})

        # Must enforce max_size constraint
        self.assertLessEqual(shared.size(), 200)

        # Wait for TTL expiry and clean up
        await asyncio.sleep(1.1)
        evicted = shared.cleanup_expired()
        self.assertGreater(evicted, 0)
        self.assertEqual(shared.size(), 0)

    async def test_scheduler_concurrency_semaphore_bound(self):
        """Verify PollingScheduler executes high-volume feed items strictly respecting max_concurrency semaphore."""
        bot = MagicMock()
        bot.is_ready.return_value = True
        bot.is_closed.return_value = False
        bot.get_guild_refresh_interval.return_value = 0 # 0 seconds to immediately trigger

        active_concurrent_tasks = 0
        peak_concurrent_tasks = 0
        lock = asyncio.Lock()

        async def mock_process_unshared(monitor):
            nonlocal active_concurrent_tasks, peak_concurrent_tasks
            async with lock:
                active_concurrent_tasks += 1
                if active_concurrent_tasks > peak_concurrent_tasks:
                    peak_concurrent_tasks = active_concurrent_tasks

            await asyncio.sleep(0.02) # Simulate network fetch latency

            async with lock:
                active_concurrent_tasks -= 1

        pipeline = MagicMock(spec=FeedPipeline)
        pipeline.process_unshared = mock_process_unshared

        # Create 50 mock monitors
        monitors = []
        for i in range(50):
            m = MagicMock()
            m.id = i
            m.guild_id = 100 + i
            m.enabled = True
            m.get_shared_key.return_value = None
            m.name = f"Monitor {i}"
            monitors.append(m)

        scheduler = PollingScheduler(bot, pipeline, lambda: monitors, max_concurrency=10)

        # Run 50 unshared tasks through the scheduler runner
        tasks = [scheduler._run_unshared_task(m) for m in monitors]
        await asyncio.gather(*tasks)

        # Peak concurrency must never exceed semaphore limit (10)
        self.assertLessEqual(peak_concurrent_tasks, 10)
        self.assertEqual(active_concurrent_tasks, 0)

    async def test_memory_notification_queue_stress_throughput(self):
        """Stress test MemoryNotificationQueue with 1,000 enqueued and dequeued messages."""
        q = MemoryNotificationQueue()

        # Enqueue 1,000 items
        for i in range(1000):
            await q.push({"task_id": i, "content": f"Alert {i}"})

        self.assertEqual(await q.qsize(), 1000)

        # Dequeue 1,000 items
        popped_count = 0
        for _ in range(1000):
            item = await q.pop()
            if item:
                popped_count += 1

        self.assertEqual(popped_count, 1000)
        self.assertEqual(await q.qsize(), 0)

if __name__ == "__main__":
    unittest.main()
