import unittest
from clients.http_client import HttpClient

class TestHttpClient(unittest.TestCase):
    def test_http_client_defaults(self):
        """Verify default configuration with TCP pool parameters."""
        client = HttpClient()
        self.assertEqual(client.default_timeout, 15)
        self.assertEqual(client.pool_limit, 100)
        self.assertEqual(client.pool_limit_per_host, 15)
        self.assertEqual(client.dns_cache_ttl, 300)
        self.assertIsNone(client._session)

    def test_http_client_custom_pool_settings(self):
        """Verify custom connection pool options."""
        custom_client = HttpClient(
            default_timeout=30,
            pool_limit=50,
            pool_limit_per_host=5,
            dns_cache_ttl=600
        )
        self.assertEqual(custom_client.default_timeout, 30)
        self.assertEqual(custom_client.pool_limit, 50)
        self.assertEqual(custom_client.pool_limit_per_host, 5)
        self.assertEqual(custom_client.dns_cache_ttl, 600)

if __name__ == "__main__":
    unittest.main()
