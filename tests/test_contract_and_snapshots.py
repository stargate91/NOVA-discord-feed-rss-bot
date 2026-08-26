import unittest
from core.webhook_server import app

class TestContractAndSnapshots(unittest.TestCase):
    """
    Contract & Schema Snapshot testing for Nova FastAPI server.
    Ensures that OpenAPI documentation, route definitions, models, and HTTP contracts do not drift unexpectedly.
    """

    def setUp(self):
        self.openapi_schema = app.openapi()

    def test_openapi_contract_metadata(self):
        """Verify OpenAPI root schema title, version, and info contract."""
        self.assertEqual(self.openapi_schema["openapi"], "3.1.0")
        self.assertEqual(self.openapi_schema["info"]["title"], "Nova Discord Bot API")
        self.assertEqual(self.openapi_schema["info"]["version"], "1.0.0")

    def test_required_api_v1_contract_routes(self):
        """Verify all critical versioned API endpoints exist in the contract schema."""
        paths = self.openapi_schema["paths"]

        schema_endpoints = [
            "/health",
            "/metrics",
            "/api/v1/metrics",
            "/admin/logs",
            "/admin/metrics",
            "/api/v1/admin/logs",
            "/api/v1/admin/metrics",
            "/api/v1/monitors/sync",
            "/api/v1/stripe/webhook",
            "/api/v1/checkout",
        ]

        for endpoint in schema_endpoints:
            self.assertIn(
                endpoint,
                paths,
                f"Missing contract endpoint: {endpoint} in OpenAPI schema."
            )

    def test_security_contract_on_admin_routes(self):
        """Verify admin routes specify required authentication headers."""
        paths = self.openapi_schema["paths"]

        # /api/v1/admin/logs GET parameters
        logs_get = paths["/api/v1/admin/logs"]["get"]
        param_names = [p["name"] for p in logs_get.get("parameters", [])]
        self.assertIn("X-Webhook-Secret", param_names)
        self.assertIn("limit", param_names)
        self.assertIn("level", param_names)

        # /api/v1/monitors/sync POST parameters
        sync_post = paths["/api/v1/monitors/sync"]["post"]
        sync_param_names = [p["name"] for p in sync_post.get("parameters", [])]
        self.assertIn("X-Webhook-Secret", sync_param_names)

    def test_response_models_contract_definitions(self):
        """Verify OpenAPI components.schemas include expected Pydantic domain models."""
        schemas = self.openapi_schema.get("components", {}).get("schemas", {})

        expected_schemas = [
            "ActionStatusResponse",
            "HealthResponse",
            "LogsQueryResponse",
            "MetricsSummaryResponse",
            "GuildPermissionsResponse",
            "LogFilterModel"
        ]

        for schema_name in expected_schemas:
            self.assertIn(
                schema_name,
                schemas,
                f"Expected schema '{schema_name}' missing from OpenAPI components."
            )

if __name__ == "__main__":
    unittest.main()
