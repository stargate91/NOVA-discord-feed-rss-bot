# Changelog

All notable changes to the Nova Discord Feed Bot platform are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-08-27 (Enterprise Architecture Refactor)

### Added
- **Monitor Registry Pattern**: Replaced static 12-branch `if-elif` chain in `core/monitor_factory.py` with dynamic, decorator-based `@MonitorFactory.register("type")` pattern.
- **FastAPI `/api/v1` Routing & OpenAPI Customization**: Enriched API routes with Pydantic v2 schemas (`LogsQueryResponse`, `MetricsSummaryResponse`, `ActionStatusResponse`, `GuildPermissionsResponse`), full parameter descriptions, and Swagger tags.
- **Bounded LRU Caches**:
  - `BoundedGuildSettingsCache` in `engine/cache.py` with 5,000 guild capacity and LRU eviction.
  - Bounded `_DEAD_CHANNELS` blacklist in `services/discord_delivery_adapter.py` with proactive sweep.
- **Database Telemetry & Slow Query Logging**: Added latency measurement on all query executions with warning logs on queries exceeding 100ms.
- **Database Connection Pool Health Probes**: Implemented `check_db_health()` and connection stats integrated with `/health` and `/api/v1/health`.
- **In-Memory Sliding-Window Rate Limiting**: Added `RateLimiter` dependency on FastAPI endpoints.
- **Sentry SDK Integration**: Added `init_sentry()` in `logger.py` with centralized error tracking.
- **DevOps & Containerization**:
  - Multi-stage production `Dockerfile` with non-root user `appuser`.
  - `docker-compose.yml` orchestrating Nova Bot, PostgreSQL 16, and Redis 7 with healthchecks and volumes.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) matrix-testing Python 3.11 and 3.12 with live PostgreSQL and Redis services.
  - Deterministic `requirements.lock` and safe `.env.example`.
- **Edge Case & Resilience Test Suite**: Added `tests/test_edge_cases_and_resilience.py` expanding test coverage to 134 automated unit/integration tests.
- **Documentation**: Added `docs/api.md`, `docs/architecture.md`, and `CONTRIBUTING.md`.

### Changed
- **Database Schema Consolidation**: Eliminated redundant raw SQL DDL in `init_db()` in favor of SQLAlchemy 2.0 declarative models (`db/schema.py`) and Alembic migrations.
- **Named Attribute Access**: Replaced fragile 5-tuple unpacking in `EntitlementService` (`get_guild_tier_limits`) with direct named attributes.
- **Code Deduplication**: Consolidated monitor database row parsing into single reusable `_parse_monitor_row()` helper in `db/repositories/monitor_repo.py`.
- **Top-level Clean Imports**: Eliminated lazy inline workaround imports in `core/bot.py`.

### Fixed
- **Production Debug Log Spam**: Removed verbose `DEBUG: on_message` log that was emitting raw user message contents at `INFO` level.
- **Message Content Mutation**: Replaced in-place `message.content` modification with clean `ctx.command` resolver in `core/bot.py`.
- **SQL Injection Risk**: Eliminated dynamic f-string formatting in `factory_reset_tables()` with static TRUNCATE and whitelist.
- **Lowercase `any` Type Hint**: Fixed built-in `any()` usage in `engine/cache.py` to `typing.Any`.

### Security
- **Constant-Time Webhook Secret Verification**: Uses `hmac.compare_digest` in `verify_webhook_secret` to protect against timing side-channel attacks.
- **Fail-Closed API Authentication**: Enforced strict 401 Unauthorized rejection when `WEBHOOK_SECRET` is unset in production.
- **Stripe Checkout IDOR Prevention**: Validated `guild_id` as a valid 64-bit Discord snowflake integer (`1000000000000000 <= guild_id <= 99999999999999999999`).

---

## [1.0.0] - 2026-08-01 (Initial Release)
- Initial modular feed bot implementation with support for YouTube, Twitch, GitHub, Steam, RSS, TMDB, and Crypto feeds.
- Asynchronous scheduling engine and Discord embeds delivery system.
