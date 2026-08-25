import asyncpg
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from logger import log
from db.schema import Base

_pool = None
_async_engine: AsyncEngine | None = None
_async_session_maker: async_sessionmaker[AsyncSession] | None = None

def get_async_engine(dsn: str | None = None) -> AsyncEngine:
    """Get or create the global SQLAlchemy async engine."""
    global _async_engine
    if _async_engine is None:
        target_dsn = dsn or "postgresql+asyncpg://postgres:postgres@localhost/feedbot"
        if target_dsn.startswith("postgresql://"):
            target_dsn = target_dsn.replace("postgresql://", "postgresql+asyncpg://", 1)
        _async_engine = create_async_engine(target_dsn, echo=False)
    return _async_engine

def get_async_session_maker(dsn: str | None = None) -> async_sessionmaker[AsyncSession]:
    """Get or create the global SQLAlchemy async session factory."""
    global _async_session_maker
    if _async_session_maker is None:
        engine = get_async_engine(dsn)
        _async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    return _async_session_maker

async def create_db_pool(
    dsn: str,
    min_size: int = 2,
    max_size: int = 20,
    max_queries: int = 50000,
    max_inactive_connection_lifetime: float = 300.0,
    command_timeout: float = 30.0
) -> asyncpg.Pool:
    """Create and register a fine-tuned asyncpg connection pool."""
    global _pool
    # Initialize SQLAlchemy async engine alongside asyncpg pool
    get_async_session_maker(dsn)
    _pool = await asyncpg.create_pool(
        dsn,
        min_size=min_size,
        max_size=max_size,
        max_queries=max_queries,
        max_inactive_connection_lifetime=max_inactive_connection_lifetime,
        command_timeout=command_timeout
    )
    return _pool

async def set_pool(pool: asyncpg.Pool):
    global _pool
    _pool = pool

async def get_pool() -> asyncpg.Pool:
    global _pool
    if not _pool:
        raise Exception("Database pool is not initialized.")
    return _pool

async def close():
    global _pool, _async_engine, _async_session_maker
    if _pool:
        await _pool.close()
        _pool = None
    if _async_engine:
        await _async_engine.dispose()
        _async_engine = None
        _async_session_maker = None
    log.info("Database connection pool closed.")

async def _fetch(query: str, *args):
    pool = await get_pool()
    return await pool.fetch(query, *args)

async def _fetchrow(query: str, *args):
    pool = await get_pool()
    return await pool.fetchrow(query, *args)

async def _fetchval(query: str, *args):
    pool = await get_pool()
    return await pool.fetchval(query, *args)

async def _execute(query: str, *args):
    pool = await get_pool()
    return await pool.execute(query, *args)

async def init_db():
    """Initialize the database and ensure all required tables and indexes exist."""
    pool = await get_pool()
    queries = [
        # 1. Guild Settings
        '''CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id BIGINT PRIMARY KEY,
            language TEXT DEFAULT 'en',
            admin_role_id BIGINT DEFAULT 0,
            alert_templates TEXT,
            premium_until TIMESTAMP,
            refresh_interval INTEGER DEFAULT 20,
            tier INTEGER DEFAULT 0,
            stripe_subscription_id TEXT,
            is_active BOOLEAN DEFAULT true,
            is_master BOOLEAN DEFAULT false,
            is_premium BOOLEAN DEFAULT false,
            custom_branding TEXT
        )''',
        # 2. Monitors
        '''CREATE TABLE IF NOT EXISTS monitors (
            id SERIAL PRIMARY KEY,
            guild_id BIGINT NOT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            discord_channel_id BIGINT,
            ping_role_id BIGINT,
            enabled BOOLEAN DEFAULT true,
            extra_settings TEXT,
            last_post_at TIMESTAMP WITH TIME ZONE
        )''',
        # 3. Published Entries
        '''CREATE TABLE IF NOT EXISTS published_entries_v2 (
            entry_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            guild_id BIGINT NOT NULL,
            feed_url TEXT,
            published_at TIMESTAMP,
            title TEXT,
            thumbnail_url TEXT,
            author_name TEXT,
            PRIMARY KEY (entry_id, platform, guild_id)
        )''',
        # 4. Bot Statuses
        '''CREATE TABLE IF NOT EXISTS bot_statuses (
            id SERIAL PRIMARY KEY,
            type TEXT NOT NULL,
            status_text TEXT NOT NULL
        )''',
        # 5. Global Bot Settings
        '''CREATE TABLE IF NOT EXISTS bot_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )''',
        # 6. Premium Codes
        '''CREATE TABLE IF NOT EXISTS premium_codes (
            code VARCHAR(50) PRIMARY KEY,
            duration_days INTEGER NOT NULL,
            max_uses INTEGER DEFAULT 1,
            used_count INTEGER DEFAULT 0,
            tier INTEGER DEFAULT 3,
            is_revoked BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        # 7. Monitor Statistics
        '''CREATE TABLE IF NOT EXISTS monitor_stats_daily (
            date DATE NOT NULL,
            guild_id BIGINT NOT NULL,
            platform TEXT NOT NULL,
            post_count INTEGER DEFAULT 0,
            PRIMARY KEY (date, guild_id, platform)
        )''',
        # 8. Payment History
        '''CREATE TABLE IF NOT EXISTS payment_history (
            id SERIAL PRIMARY KEY,
            guild_id BIGINT NOT NULL,
            stripe_session_id TEXT UNIQUE,
            price_id TEXT,
            amount_cents INTEGER,
            currency TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        # 9. Premium Redemptions
        '''CREATE TABLE IF NOT EXISTS premium_redemptions (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50),
            guild_id BIGINT,
            redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        # 10. Announcements
        '''CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        )''',
        # 11. YouTube Resolution Cache
        '''CREATE TABLE IF NOT EXISTS youtube_cache (
            query TEXT PRIMARY KEY,
            channel_id TEXT NOT NULL,
            title TEXT NOT NULL,
            thumbnail TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        # 12. Steam Resolution Cache
        '''CREATE TABLE IF NOT EXISTS steam_cache (
            query TEXT PRIMARY KEY,
            appid TEXT NOT NULL,
            title TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''',
        # Indexes
        '''CREATE INDEX IF NOT EXISTS idx_published_entries_time ON published_entries_v2 (published_at DESC)''',
        '''CREATE INDEX IF NOT EXISTS idx_monitors_guild ON monitors (guild_id)'''
    ]

    async with pool.acquire() as conn:
        async with conn.transaction():
            for q in queries:
                await conn.execute(q)

    log.info("Database tables and indexes initialized.")
