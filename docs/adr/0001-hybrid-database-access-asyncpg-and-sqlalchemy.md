# ADR-0001: Hybrid Database Access — asyncpg High-Throughput & SQLAlchemy Declarative Migrations

- **Status:** Accepted
- **Date:** 2026-08-25
- **Deciders:** Nova Core Architecture Team
- **Consulted:** DevOps, Backend Engineers

---

## Context & Problem Statement

Nova Feed Bot is a high-throughput, multi-tenant Discord notification aggregator designed to scale to 10,000+ Discord guilds. In this architecture:
1. The ingestion pipeline polls and checks hundreds of RSS, YouTube, Twitch, Steam, and Reddit feeds every minute, generating thousands of candidate items.
2. The database must deduplicate and bulk-insert published entries (`published_entries_v2`) with sub-millisecond query latency.
3. At the same time, the database schema requires enterprise-grade versioning, declarative DDL management, and robust migration tooling (Alembic) to evolve smoothly across development, staging, and production environments.

A common question is: **Why use both `asyncpg` and `SQLAlchemy` instead of a full SQLAlchemy ORM (`AsyncSession`) architecture?**

---

## Decision Drivers

- **Throughput & Latency:** Ingestion loops and deduplication checks are CPU- and I/O-bound hot paths. Sub-millisecond raw SQL execution is required.
- **Memory Footprint:** Loading tens of thousands of ORM model instances with full identity-map state tracking adds significant memory pressure in high-concurrency Python processes.
- **Schema Maintainability & Migrations:** Raw SQL DDL scripts are error-prone. Declarative schema definition with Alembic auto-generation is necessary for production stability.
- **Bulk Operation Performance:** Direct PostgreSQL binary protocol operations (`executemany`, `ANY($1)`) must be leveraged without ORM abstraction overhead.

---

## Considered Options

1. **Full SQLAlchemy 2.0 ORM (`AsyncSession` everywhere)**
2. **Pure Raw SQL (`asyncpg` only, with manual SQL migration scripts)**
3. **Hybrid Architecture: SQLAlchemy Declarative Schema + Alembic Migrations + `asyncpg` Fast-Path Repositories** *(Selected)*

---

## Decision Outcome

**Chosen Option: Hybrid Architecture (Option 3).**

### 1. Schema & Migration Layer: SQLAlchemy + Alembic
- All 12 tables and composite indexes are formally declared using SQLAlchemy 2.0 Typed `Mapped` columns in [db/schema.py](file:///e:/projects/repos/bots/nova/db/schema.py).
- Alembic uses `Base.metadata` in [migrations/env.py](file:///e:/projects/repos/bots/nova/migrations/env.py) to manage revisions and schema state.

### 2. High-Throughput Data Access Layer: `asyncpg` Repositories
- Repositories in `db/repositories/` utilize connection pooling (`get_pool()`) and execute direct binary protocol queries.
- High-volume operations (e.g. `mark_as_published_bulk`, `get_published_ids_bulk`, `cleanup_old_history`) use `executemany` and parameterized `$1, $2` SQL for maximum speed.
- Data returned from queries is mapped into lightweight, validated Pydantic v2 domain models (`DomainModel`, `GuildSettings`, `MonitorConfig`).

### 3. Transactional Boundaries
- Atomic operations (e.g. `redeem_code`, Stripe subscription checkout activation) use the `@asynccontextmanager async def transaction()` pool helper for clean `COMMIT` / `ROLLBACK` guarantees.

---

## Pros and Cons

### Pros
- **Maximum Performance:** `asyncpg` is the fastest PostgreSQL driver in the Python ecosystem (up to 3-5x faster than full ORM session tracking).
- **Minimal Memory Overhead:** No ORM identity map caching millions of temporary feed item entities.
- **Declarative Schema Safety:** Database structure is codified and migratable across environments via Alembic.
- **Type-Safe Domain Models:** Pydantic v2 models encapsulate domain validation and serialization.

### Cons & Mitigations
- **Duality / Repetition:** Table column names in `schema.py` must match repository SQL queries.
  * *Mitigation:* Comprehensive integration and contract tests in `tests/test_database_orm_and_migrations.py` validate schema definitions against repository queries in memory.
