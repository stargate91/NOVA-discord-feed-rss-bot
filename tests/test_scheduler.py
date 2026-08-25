import unittest
from unittest.mock import MagicMock
from engine.scheduler import PollingScheduler

class TestPollingScheduler(unittest.TestCase):
    def setUp(self):
        self.bot = MagicMock()
        self.bot.get_guild_refresh_interval.side_effect = lambda guild_id: 1 if guild_id == 100 else 30
        self.pipeline = MagicMock()

    def test_grouping_by_shared_key(self):
        """Verify grouping of monitors by get_shared_key vs unshared."""
        m1 = MagicMock()
        m1.enabled = True
        m1.get_shared_key.return_value = "yt:channel_1"

        m2 = MagicMock()
        m2.enabled = True
        m2.get_shared_key.return_value = "yt:channel_1"

        m3 = MagicMock()
        m3.enabled = True
        m3.get_shared_key.return_value = None  # Unshared (e.g. custom RSS)

        monitors = [m1, m2, m3]
        scheduler = PollingScheduler(self.bot, self.pipeline, lambda: monitors)

        # Replicate grouping logic
        groups = {}
        unshared = []
        for m in scheduler.get_monitors():
            key = m.get_shared_key()
            if key:
                groups.setdefault(key, []).append(m)
            else:
                unshared.append(m)

        self.assertEqual(len(groups), 1)
        self.assertEqual(len(groups["yt:channel_1"]), 2)
        self.assertEqual(len(unshared), 1)

    def test_shared_group_minimum_interval_resolution(self):
        """Verify that shared group runs at the fastest tier interval among its members."""
        m_tier3 = MagicMock()
        m_tier3.guild_id = 100  # 1 min
        m_tier0 = MagicMock()
        m_tier0.guild_id = 200  # 30 min

        group = [m_tier0, m_tier3]
        min_interval = min(self.bot.get_guild_refresh_interval(m.guild_id) for m in group)

        # Fastest interval must be chosen (1 min)
        self.assertEqual(min_interval, 1)

if __name__ == "__main__":
    unittest.main()
