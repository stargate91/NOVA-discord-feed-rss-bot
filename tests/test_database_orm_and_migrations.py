import os
import unittest
from sqlalchemy import select
from db.schema import (
    Base,
    GuildSettingsTable,
    MonitorTable,
    PublishedEntryTable,
    BotStatusTable,
    PaymentHistoryTable,
)

class TestDatabaseOrmAndMigrations(unittest.IsolatedAsyncioTestCase):
    def test_declarative_schema_table_registry(self):
        """Verify all 12 required tables are properly registered in SQLAlchemy Base.metadata."""
        expected_tables = {
            "guild_settings",
            "monitors",
            "published_entries_v2",
            "bot_statuses",
            "bot_settings",
            "premium_codes",
            "monitor_stats_daily",
            "payment_history",
            "premium_redemptions",
            "announcements",
            "youtube_cache",
            "steam_cache",
        }
        registered_tables = set(Base.metadata.tables.keys())
        for table in expected_tables:
            self.assertIn(table, registered_tables, f"Table {table} is missing from Base.metadata!")

    def test_orm_column_attributes(self):
        """Verify primary keys and critical columns on primary ORM tables."""
        # GuildSettingsTable
        self.assertIn("guild_id", GuildSettingsTable.__table__.columns)
        self.assertTrue(GuildSettingsTable.__table__.columns["guild_id"].primary_key)
        self.assertIn("language", GuildSettingsTable.__table__.columns)
        self.assertIn("tier", GuildSettingsTable.__table__.columns)
        self.assertTrue(GuildSettingsTable.__table__.columns["refresh_interval"].index)

        # MonitorTable
        self.assertIn("id", MonitorTable.__table__.columns)
        self.assertTrue(MonitorTable.__table__.columns["id"].primary_key)
        self.assertIn("guild_id", MonitorTable.__table__.columns)
        self.assertIn("type", MonitorTable.__table__.columns)
        self.assertTrue(MonitorTable.__table__.columns["type"].index)
        self.assertTrue(MonitorTable.__table__.columns["guild_id"].index)

        # Check composite index
        index_names = [idx.name for idx in MonitorTable.__table__.indexes]
        self.assertIn("idx_monitors_guild_type", index_names)

        # PublishedEntryTable (composite PK)
        pk_cols = [c.name for c in PublishedEntryTable.__table__.primary_key.columns]
        self.assertEqual(set(pk_cols), {"entry_id", "platform", "guild_id"})

        # PaymentHistoryTable
        self.assertIn("stripe_session_id", PaymentHistoryTable.__table__.columns)

    def test_orm_models_crud(self):
        """Verify in-memory SQLite works with all declarative ORM models and schema DDL."""
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session

        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)

        with Session(engine) as session:
            # 1. Create Guild Settings
            guild = GuildSettingsTable(
                guild_id=1001,
                language="hu",
                tier=2,
                refresh_interval=10
            )
            session.add(guild)

            # 2. Create Monitor
            mon = MonitorTable(
                guild_id=1001,
                type="youtube",
                name="Nova Channel",
                enabled=True
            )
            session.add(mon)

            # 3. Create Bot Status
            status = BotStatusTable(
                type="watching",
                status_text="YouTube Feeds"
            )
            session.add(status)

            session.commit()

            # 4. Query back
            stmt = select(GuildSettingsTable).where(GuildSettingsTable.guild_id == 1001)
            result = session.execute(stmt)
            fetched_guild = result.scalar_one_or_none()

            self.assertIsNotNone(fetched_guild)
            self.assertEqual(fetched_guild.guild_id, 1001)
            self.assertEqual(fetched_guild.language, "hu")
            self.assertEqual(fetched_guild.tier, 2)

            stmt_mon = select(MonitorTable).where(MonitorTable.guild_id == 1001)
            result_mon = session.execute(stmt_mon)
            fetched_mon = result_mon.scalar_one_or_none()

            self.assertIsNotNone(fetched_mon)
            self.assertEqual(fetched_mon.type, "youtube")
            self.assertEqual(fetched_mon.name, "Nova Channel")

        engine.dispose()

    def test_alembic_configuration_and_migrations_exist(self):
        """Verify Alembic configuration files and baseline migration exist."""
        self.assertTrue(os.path.exists("alembic.ini"), "alembic.ini missing!")
        self.assertTrue(os.path.exists("migrations/env.py"), "migrations/env.py missing!")
        self.assertTrue(os.path.exists("migrations/script.py.mako"), "migrations/script.py.mako missing!")
        self.assertTrue(os.path.exists("migrations/versions/0001_initial_baseline.py"), "Baseline migration missing!")

    def test_alembic_dynamic_database_url_resolution(self):
        """Verify get_database_url correctly resolves env vars and converts to asyncpg dialect."""
        from migrations.env import get_database_url

        with unittest.mock.patch.dict(os.environ, {"DATABASE_URL": "postgresql://usr:pwd@db.host:5432/mybot"}):
            url = get_database_url()
            self.assertEqual(url, "postgresql+asyncpg://usr:pwd@db.host:5432/mybot")

        with unittest.mock.patch.dict(
            os.environ,
            {"DB_HOST": "prod-host", "DB_PORT": "5439", "DB_NAME": "botdb", "DB_USER": "admin", "DB_PASS": "pass123"},
            clear=True
        ):
            url = get_database_url()
            self.assertEqual(url, "postgresql+asyncpg://admin:pass123@prod-host:5439/botdb")

    def test_devops_docker_and_k8s_manifests_exist(self):
        """Verify staging, prod docker compose and k8s directory manifests."""
        self.assertTrue(os.path.exists("docker-compose.staging.yml"), "docker-compose.staging.yml missing!")
        self.assertTrue(os.path.exists("docker-compose.prod.yml"), "docker-compose.prod.yml missing!")
        self.assertTrue(os.path.exists(".env.staging.example"), ".env.staging.example missing!")
        self.assertTrue(os.path.exists(".env.prod.example"), ".env.prod.example missing!")
        self.assertTrue(os.path.exists("k8s/namespace.yaml"), "k8s/namespace.yaml missing!")
        self.assertTrue(os.path.exists("k8s/configmap.yaml"), "k8s/configmap.yaml missing!")
        self.assertTrue(os.path.exists("k8s/secrets.yaml"), "k8s/secrets.yaml missing!")
        self.assertTrue(os.path.exists("k8s/gateway-deployment.yaml"), "k8s/gateway-deployment.yaml missing!")
        self.assertTrue(os.path.exists("k8s/feed-worker-deployment.yaml"), "k8s/feed-worker-deployment.yaml missing!")
        self.assertTrue(os.path.exists("k8s/api-worker-deployment.yaml"), "k8s/api-worker-deployment.yaml missing!")
        self.assertTrue(os.path.exists("k8s/api-service.yaml"), "k8s/api-service.yaml missing!")
        self.assertTrue(os.path.exists("k8s/hpa.yaml"), "k8s/hpa.yaml missing!")
        self.assertTrue(os.path.exists("k8s/kustomization.yaml"), "k8s/kustomization.yaml missing!")
        self.assertTrue(os.path.exists("pyproject.toml"), "pyproject.toml missing!")
        self.assertTrue(os.path.exists("requirements.txt"), "requirements.txt missing!")
        self.assertTrue(os.path.exists("requirements-dev.txt"), "requirements-dev.txt missing!")
        self.assertTrue(os.path.exists("requirements.lock"), "requirements.lock missing!")
        self.assertTrue(os.path.exists("docs/adr/README.md"), "docs/adr/README.md missing!")
        self.assertTrue(os.path.exists("docs/adr/0001-hybrid-database-access-asyncpg-and-sqlalchemy.md"), "ADR-0001 missing!")
        self.assertTrue(os.path.exists("docs/adr/0002-decoupled-microservices-and-worker-architecture.md"), "ADR-0002 missing!")
        self.assertTrue(os.path.exists("docs/adr/0003-thread-safe-bounded-lru-caching.md"), "ADR-0003 missing!")
        self.assertTrue(os.path.exists("docs/adr/0004-composition-root-and-dependency-injection.md"), "ADR-0004 missing!")
        self.assertTrue(os.path.exists("docs/adr/0005-resilient-dead-channel-circuit-breaker.md"), "ADR-0005 missing!")
        self.assertTrue(os.path.exists("LICENSE"), "LICENSE file missing!")

if __name__ == "__main__":
    unittest.main()
