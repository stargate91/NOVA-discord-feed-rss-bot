import unittest
import time
from engine.cache import SharedDataCache

class TestSharedDataCache(unittest.TestCase):
    def setUp(self):
        self.cache = SharedDataCache(default_ttl=2, max_size=5)

    def test_set_and_get_fresh_data(self):
        """Verify storing and retrieving fresh unexpired data."""
        self.cache.set_shared_data("yt:ch1", {"title": "Test Video"})
        cached = self.cache.get_shared_data("yt:ch1")
        self.assertIsNotNone(cached)
        self.assertEqual(cached["title"], "Test Video")

    def test_ttl_expiration_on_read(self):
        """Verify that expired items return None and are evicted on read."""
        self.cache.set_shared_data("temp_key", "value", ttl=1)
        time.sleep(1.1)
        # Should be expired and automatically removed
        self.assertIsNone(self.cache.get_shared_data("temp_key"))
        self.assertNotIn("temp_key", self.cache._shared_cache)

    def test_cleanup_expired(self):
        """Verify explicit garbage collection of all expired entries."""
        self.cache.set_shared_data("item1", "v1", ttl=1)
        self.cache.set_shared_data("item2", "v2", ttl=1)
        self.cache.set_shared_data("item3", "v3", ttl=10)

        self.assertEqual(self.cache.size(), 3)
        time.sleep(1.1)

        evicted = self.cache.cleanup_expired()
        self.assertEqual(evicted, 2)
        self.assertEqual(self.cache.size(), 1)
        self.assertIsNotNone(self.cache.get_shared_data("item3"))

    def test_max_size_lru_eviction(self):
        """Verify that when cache exceeds max_size, oldest items are pruned."""
        small_cache = SharedDataCache(default_ttl=100, max_size=3)
        small_cache.set_shared_data("k1", "v1")
        time.sleep(0.01)
        small_cache.set_shared_data("k2", "v2")
        time.sleep(0.01)
        small_cache.set_shared_data("k3", "v3")

        # Exceed capacity
        time.sleep(0.01)
        small_cache.set_shared_data("k4", "v4")

        # Total size must not exceed max_size
        self.assertLessEqual(small_cache.size(), 3)
        # Oldest key k1 should have been evicted
        self.assertIsNone(small_cache.get_shared_data("k1"))
        # Newest key k4 must be present
        self.assertIsNotNone(small_cache.get_shared_data("k4"))

    def test_stats_and_clear(self):
        """Verify cache health stats and clear method."""
        self.cache.set_shared_data("stat1", "a")
        self.cache.tmdb_genres_cache["en"] = {28: "Action"}

        stats = self.cache.stats()
        self.assertEqual(stats["entries"], 1)
        self.assertEqual(stats["max_size"], 5)
        self.assertEqual(stats["tmdb_genre_sets"], 1)

        self.cache.clear()
        self.assertEqual(self.cache.size(), 0)
        self.assertEqual(len(self.cache.tmdb_genres_cache), 0)

if __name__ == "__main__":
    unittest.main()
