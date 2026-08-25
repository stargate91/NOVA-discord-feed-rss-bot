import unittest
import logging
import time
from unittest.mock import MagicMock
from starlette.testclient import TestClient
from logger import log, log_context, get_recent_logs, _ring_buffer_handler
from services.metrics_service import MetricsService, metrics
from core.webhook_server import app, setup_webhook_bot

class TestStructuredLoggingAndMetrics(unittest.TestCase):
    def setUp(self):
        _ring_buffer_handler.clear()
        self.bot = MagicMock()
        self.bot.config = {}
        setup_webhook_bot(self.bot)
        self.client = TestClient(app)

    def test_structured_log_context(self):
        """Verify log_context attaches guild_id, platform, and other metadata to records."""
        with log_context(guild_id=98765, platform="twitch", monitor_id=42):
            log.info("Testing context injection into log stream", extra={"latency_ms": 12.3})

        logs = get_recent_logs(limit=10)
        self.assertGreaterEqual(len(logs), 1)
        found = next((l for l in logs if "Testing context injection" in l["message"]), None)
        self.assertIsNotNone(found)
        self.assertEqual(found["guild_id"], 98765)
        self.assertEqual(found["platform"], "twitch")
        self.assertEqual(found["monitor_id"], 42)
        self.assertEqual(found["latency_ms"], 12.3)

    def test_ring_buffer_filtering(self):
        """Verify get_recent_logs filters properly by level, guild_id, platform, and search string."""
        with log_context(guild_id=100, platform="youtube"):
            log.info("YouTube video discovered")
            log.warning("YouTube quota high")

        with log_context(guild_id=200, platform="steam"):
            log.info("Steam game sale")
            log.error("Steam API timeout")

        # 1. Filter by level
        error_logs = get_recent_logs(level="ERROR")
        self.assertEqual(len(error_logs), 1)
        self.assertEqual(error_logs[0]["message"], "Steam API timeout")

        # 2. Filter by guild_id
        g100_logs = get_recent_logs(guild_id=100)
        self.assertEqual(len(g100_logs), 2)

        # 3. Filter by platform
        steam_logs = get_recent_logs(platform="steam")
        self.assertEqual(len(steam_logs), 2)

        # 4. Search substring
        sale_logs = get_recent_logs(search="sale")
        self.assertEqual(len(sale_logs), 1)
        self.assertEqual(sale_logs[0]["platform"], "steam")

    def test_metrics_service_counters_and_gauges(self):
        """Verify MetricsService increments counters and sets gauges correctly."""
        test_metrics = MetricsService()

        test_metrics.record_feed_item_discovered("youtube", count=5)
        test_metrics.record_notification_delivered("youtube", success=True, duration_seconds=0.15)
        test_metrics.record_notification_delivered("youtube", success=False, duration_seconds=0.05)
        test_metrics.set_gauge("active_monitors_count", 12, labels={"platform": "youtube"})

        summary = test_metrics.export_summary()
        self.assertIn("counters", summary)
        self.assertIn("gauges", summary)
        self.assertIn("latencies", summary)

        self.assertEqual(summary["counters"]["feed_items_discovered_total"]["total"], 5.0)
        self.assertEqual(summary["counters"]["notifications_delivered_total"]["total"], 2.0)
        self.assertEqual(summary["gauges"]["active_monitors_count"]["platform=youtube"], 12.0)

    def test_metrics_prometheus_exposition(self):
        """Verify Prometheus text format export contains expected series and headers."""
        test_metrics = MetricsService()
        test_metrics.record_feed_item_discovered("twitch", count=2)
        test_metrics.record_rate_limit("twitch")

        prom_text = test_metrics.export_prometheus()
        self.assertIn("# TYPE feed_items_discovered_total counter", prom_text)
        self.assertIn('feed_items_discovered_total{platform="twitch"} 2.0', prom_text)
        self.assertIn('rate_limits_encountered_total{platform="twitch"} 1.0', prom_text)

    def test_admin_api_logs_endpoint(self):
        """Verify GET /api/admin/logs returns ring buffer logs with query filters."""
        with log_context(guild_id=777, platform="github"):
            log.info("API Release event triggered")

        res = self.client.get("/api/admin/logs?guild_id=777&platform=github")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("logs", data)
        self.assertIn("count", data)
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["logs"][0]["guild_id"], 777)

    def test_admin_api_metrics_endpoints(self):
        """Verify GET /api/admin/metrics and GET /metrics return valid telemetry."""
        # JSON summary
        res_json = self.client.get("/api/admin/metrics")
        self.assertEqual(res_json.status_code, 200)
        data = res_json.json()
        self.assertIn("uptime_seconds", data)
        self.assertIn("counters", data)

        # Prometheus text
        res_prom = self.client.get("/metrics")
        self.assertEqual(res_prom.status_code, 200)
        self.assertIn("process_uptime_seconds", res_prom.text)

if __name__ == "__main__":
    unittest.main()
