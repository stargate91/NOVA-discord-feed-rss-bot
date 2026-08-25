import os
import unittest
from datetime import datetime, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from db.schema import (
    Base,
    GuildSettingsTable,
    MonitorTable,
    PublishedEntryTable,
    BotStatusTable,
    BotSettingTable,
    PremiumCodeTable,
    MonitorStatsDailyTable,
    PaymentHistoryTable,
    PremiumRedemptionTable,
    AnnouncementTable,
    YouTubeCacheTable,
    SteamCacheTable,
)
from db.connection import get_async_engine, get_async_session_maker

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

        # MonitorTable
        self.assertIn("id", MonitorTable.__table__.columns)
        self.assertTrue(MonitorTable.__table__.columns["id"].primary_key)
        self.assertIn("guild_id", MonitorTable.__table__.columns)
        self.assertIn("type", MonitorTable.__table__.columns)

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

if __name__ == "__main__":
    unittest.main()
