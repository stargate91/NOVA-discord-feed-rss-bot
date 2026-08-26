# ADR-0004: Centralized Composition Root (`BotContainer`) & Cog Decomposition

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Nova Core Architecture Team

---

## Context & Problem Statement

Historically, the `FeedBot` class acted as a "God Object" with over 300 lines of code handling:
- Discord WebSocket Gateway event loop
- Configuration file reading and disk serialization
- Discord Cog loading and extension lifecycle
- Guild join/leave events and PostgreSQL active state tracking
- Centralized error handlers (prefix, slash, app commands)
- Master guild authorization checks
- Direct instantiation of all underlying services

This tight coupling caused circular import workarounds (`lazy imports`) and made unit testing individual domain services difficult.

---

## Decision Outcome

**Chosen Solution: Explicit Composition Root via `BotContainer` and Cog Decomposition.**

1. **`BotContainer` ([core/container.py](file:///e:/projects/repos/bots/nova/core/container.py)):**
   - Serves as the single **Composition Root** for the application.
   - Instantiates and wires dependencies in proper topological order:
     `Config` ➔ `Cache` ➔ `Database Pool` ➔ `HTTP Client` ➔ `Localization/Entitlement/Permission Services` ➔ `Delivery Adapter` ➔ `Notification Service` ➔ `Pipeline/Scheduler` ➔ `Bot Client`.

2. **Cog Decomposition:**
   - **`GuildLifecycleCog` ([cogs/guild_lifecycle_cog.py](file:///e:/projects/repos/bots/nova/cogs/guild_lifecycle_cog.py)):** Dedicated to `on_ready`, `on_guild_join`, and `on_guild_remove` DB synchronization.
   - **`ErrorHandlerCog` ([cogs/error_handler_cog.py](file:///e:/projects/repos/bots/nova/cogs/error_handler_cog.py)):** Dedicated to command errors and exception telemetry.
   - **`CommandFilterCog` ([cogs/command_filter_cog.py](file:///e:/projects/repos/bots/nova/cogs/command_filter_cog.py)):** Dedicated to master guild command authorization.

3. **Lean `FeedBot` ([core/bot.py](file:///e:/projects/repos/bots/nova/core/bot.py)):**
   - Reduced from 301 lines to ~115 lines, focusing strictly on its primary responsibility: being a `commands.Bot` Discord client.

---

## Pros and Cons

### Pros
- **Single Responsibility Principle (SRP):** Each class and Cog has one clearly defined role.
- **Zero Circular Imports:** Dependencies flow in a strict, acyclic direction from the Composition Root downwards.
- **Testability:** Any individual service (e.g. `NotificationService`, `EntitlementService`) can be unit-tested in complete isolation with mock adapters.
