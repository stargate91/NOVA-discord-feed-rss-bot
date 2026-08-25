import unittest
import time
from core.base_monitor import (
    is_channel_dead,
    mark_channel_dead,
    get_dead_channel_count,
    _DEAD_CHANNELS
)

class TestDeadChannelBlacklist(unittest.TestCase):
    def setUp(self):
        _DEAD_CHANNELS.clear()

    def test_unlisted_channel_is_not_dead(self):
        """Verify that an untracked channel is not marked dead."""
        self.assertFalse(is_channel_dead(999999))

    def test_mark_and_check_dead_channel(self):
        """Verify blacklisting a deleted/inaccessible channel."""
        mark_channel_dead(123456, ttl=10)
        self.assertTrue(is_channel_dead(123456))
        self.assertEqual(get_dead_channel_count(), 1)

    def test_dead_channel_ttl_expiration(self):
        """Verify that a blacklisted channel expires and becomes eligible again."""
        mark_channel_dead(654321, ttl=1)
        self.assertTrue(is_channel_dead(654321))

        time.sleep(1.1)
        # Should now be expired and removed
        self.assertFalse(is_channel_dead(654321))
        self.assertEqual(get_dead_channel_count(), 0)

    def test_invalid_channel_id_handling(self):
        """Verify that None/0 channel IDs are handled safely."""
        self.assertTrue(is_channel_dead(None))
        self.assertTrue(is_channel_dead(0))

if __name__ == "__main__":
    unittest.main()
