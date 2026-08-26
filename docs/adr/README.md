# Architecture Decision Records (ADRs)

This directory contains the formal **Architecture Decision Records (ADRs)** for the Nova Discord Feed Bot project. Each ADR captures an important architectural decision, the context behind it, alternative options considered, and the resulting trade-offs.

## Index of Architectural Decisions

| ADR ID | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| **[ADR-0001](0001-hybrid-database-access-asyncpg-and-sqlalchemy.md)** | Hybrid Database Access: asyncpg High-Throughput & SQLAlchemy Declarative Migrations | **Accepted** | 2026-08-25 |
| **[ADR-0002](0002-decoupled-microservices-and-worker-architecture.md)** | Decoupled Microservices & Worker Architecture (Gateway, Feed, API) | **Accepted** | 2026-08-25 |
| **[ADR-0003](0003-thread-safe-bounded-lru-caching.md)** | Thread-Safe Bounded LRU & Shared Feed Caching Strategy | **Accepted** | 2026-08-26 |
| **[ADR-0004](0004-composition-root-and-dependency-injection.md)** | Centralized Composition Root (`BotContainer`) & Cog Decomposition | **Accepted** | 2026-08-26 |
| **[ADR-0005](0005-resilient-dead-channel-circuit-breaker.md)** | In-Memory Dead Channel Circuit Breaker for Rate-Limit Isolation | **Accepted** | 2026-08-26 |

---

## ADR Lifecycle & Template

When proposing a new architectural change, create a new document in `docs/adr/` following the format:
- **Title**: `XXXX-descriptive-decision-name.md`
- **Status**: `Proposed` | `Accepted` | `Deprecated` | `Superseded`
- **Context & Problem Statement**: Why is this decision required?
- **Decision Drivers**: Key architectural drivers (Performance, Reliability, Security, Maintainability).
- **Considered Options**: Alternative technologies or approaches evaluated.
- **Decision Outcome**: What was chosen and why.
- **Pros & Cons / Consequences**: Documented positive and negative impacts.
