import time
import asyncpg
from typing import AsyncGenerator
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from logger import log
from db.schema import Base

_pool: asyncpg.Pool | None = None
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

async def set_pool(pool: asyncpg.Pool | None):
    """Set the active pool (primarily used for test mocking)."""
    global _pool
    _pool = pool

async def get_pool() -> asyncpg.Pool:
    """Retrieve active asyncpg connection pool or raise exception if uninitialized."""
    global _pool
    if not _pool:
        raise Exception("Database pool is not initialized.")
    return _pool

async def close():
    """Gracefully close the asyncpg connection pool and dispose SQLAlchemy async engine."""
    global _pool, _async_engine, _async_session_maker
    if _pool:
        await _pool.close()
        _pool = None
    if _async_engine:
        await _async_engine.dispose()
        _async_engine = None
        _async_session_maker = None
    log.info("Database connection pool closed.")

@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Acquire a dedicated asyncpg connection from the pool."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn

@asynccontextmanager
async def transaction() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Acquire a connection from the pool and start an atomic transaction.
    Automatically commits on normal completion or rolls back if an exception is raised.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            yield conn

SLOW_QUERY_THRESHOLD_MS: float = 100.0

def _record_query_telemetry(operation: str, query: str, duration_sec: float):
    """Record query metrics and emit slow query warnings if threshold exceeded."""
    duration_ms = duration_sec * 1000.0
    try:
        from services.metrics_service import metrics
        metrics.increment("db_queries_total", labels={"operation": operation})
        metrics.observe_duration("db_query_duration_seconds", duration_sec, labels={"operation": operation})
        if duration_ms > SLOW_QUERY_THRESHOLD_MS:
            metrics.increment("db_slow_queries_total", labels={"operation": operation})
            clean_q = " ".join(query.split())[:150]
            log.warning(f"[DB Slow Query] {duration_ms:.1f}ms (threshold: {SLOW_QUERY_THRESHOLD_MS}ms) | Op: {operation} | SQL: {clean_q}")
    except Exception:
        pass

async def _fetch(query: str, *args):
    """Execute query and fetch all result rows with query timing and telemetry."""
    pool = await get_pool()
    t0 = time.perf_counter()
    try:
        return await pool.fetch(query, *args)
    finally:
        _record_query_telemetry("fetch", query, time.perf_counter() - t0)

async def _fetchrow(query: str, *args):
    """Execute query and fetch first result row with query timing and telemetry."""
    pool = await get_pool()
    t0 = time.perf_counter()
    try:
        return await pool.fetchrow(query, *args)
    finally:
        _record_query_telemetry("fetchrow", query, time.perf_counter() - t0)

async def _fetchval(query: str, *args):
    """Execute query and fetch a single scalar value with query timing and telemetry."""
    pool = await get_pool()
    t0 = time.perf_counter()
    try:
        return await pool.fetchval(query, *args)
    finally:
        _record_query_telemetry("fetchval", query, time.perf_counter() - t0)

async def _execute(query: str, *args):
    """Execute SQL query or command with query timing and telemetry."""
    pool = await get_pool()
    t0 = time.perf_counter()
    try:
        return await pool.execute(query, *args)
    finally:
        _record_query_telemetry("execute", query, time.perf_counter() - t0)

async def check_db_health() -> dict:
    """
    Execute connection pool health probe and measure database query latency.
    Returns health status, latency in milliseconds, and pool connection statistics.
    """
    try:
        t0 = time.perf_counter()
        val = await _fetchval("SELECT 1")
        latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        pool_stats = get_pool_stats()
        return {
            "status": "healthy" if val == 1 else "degraded",
            "latency_ms": latency_ms,
            "pool": pool_stats
        }
    except Exception as e:
        log.error(f"[DB Health] Health probe failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "pool": get_pool_stats()
        }

def get_pool_stats() -> dict:
    """Return runtime connection pool statistics for observability and monitoring."""
    global _pool
    if not _pool:
        return {"initialized": False}
    try:
        size = _pool.get_size()
        free_size = _pool.get_idle_size()
        min_size = _pool.get_min_size()
        max_size = _pool.get_max_size()
        return {
            "initialized": True,
            "current_size": size,
            "free_size": free_size,
            "used_size": size - free_size,
            "min_size": min_size,
            "max_size": max_size,
        }
    except Exception:
        return {"initialized": True}

async def init_db():
    """
    Initialize database schema dynamically from SQLAlchemy declarative models (Base.metadata).
    Consolidates schema to SQLAlchemy 2.0 / Alembic as the single source of truth,
    eliminating redundant raw DDL string definitions.
    """
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Database schema initialized and verified against SQLAlchemy Base.metadata.")

__all__ = [
    "create_db_pool",
    "get_pool",
    "set_pool",
    "init_db",
    "close",
    "get_connection",
    "transaction",
    "check_db_health",
    "get_pool_stats",
    "_fetch",
    "_fetchrow",
    "_fetchval",
    "_execute",
    "get_async_engine",
    "get_async_session_maker",
]
