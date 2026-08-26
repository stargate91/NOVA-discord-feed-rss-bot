# Contributing to Nova Discord Feed Bot

Thank you for your interest in contributing to the Nova project! This document provides guidelines and workflows for contributing to our codebase.

---

## 1. Development Environment Setup

### Prerequisites
- Python 3.11 or 3.12
- PostgreSQL 14+ (or Docker)
- Redis 7+ (optional for distributed mode)
- Git

### Setup Steps
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/stargate91/discord-feed-bot.git
   cd discord-feed-bot
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install development dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```

4. Prepare your environment file:
   ```bash
   cp .env.example .env
   ```

---

## 2. Coding Standards & Guidelines

- **Type Annotations**: All function signatures, class attributes, and return types must be fully typed with Python's `typing` module (`Any`, `Optional`, `Union`, `list[str]`, etc.). Do not use the lowercase `any` built-in function as a type.
- **Domain Models**: Use Pydantic v2 `DomainModel` (`models.base.DomainModel`) for all data transfer objects and API schemas.
- **Asynchronous Execution**: All I/O operations (network requests, DB operations, Discord interactions) must be asynchronous (`async` / `await`). Never use blocking calls like `requests.get()` or `time.sleep()`.
- **Database Access**: Use repository functions in `db/repositories/`. Never execute arbitrary unparameterized raw SQL strings. Always use parameterized queries (`$1, $2, ...`) or SQLAlchemy ORM queries.

---

## 3. Adding a New Monitor Provider

To add a new platform feed monitor (e.g. Reddit, TikTok, Bluesky):

1. **Create the Monitor Class in `monitors/`**:
   Inherit from `core.base_monitor.BaseMonitor` and register it with the `@MonitorFactory.register("platform_name")` decorator:

   ```python
   from core.base_monitor import BaseMonitor
   from core.monitor_factory import MonitorFactory
   from clients import http_client

   @MonitorFactory.register("bluesky")
   class BlueskyMonitor(BaseMonitor):
       def __init__(self, bot, config):
           super().__init__(bot, config)
           self.handle = config.get("handle") or config.get("username")

       async def fetch_new_items(self) -> list:
           # Fetch and return new post items
           return []

       def get_item_id(self, item) -> str:
           return str(item["uri"])

       async def process_item(self, item):
           # Format embed and dispatch via self.send_update()
           await self.send_update(content=f"New post from {self.handle}")

       async def get_latest_item(self):
           items = await self.fetch_new_items()
           return items[0] if items else None
   ```

2. **Add Unit Tests**:
   Add a dedicated test file in `tests/test_bluesky_monitor.py` verifying parsing, deduplication, and error handling.

---

## 4. Testing & Code Quality

Always run the full test suite, linter, and verify code coverage before opening a pull request:

```bash
# Run all unit and integration tests with pytest
pytest -v

# Run linter
ruff check .

# Run tests with code coverage report
coverage run -m pytest -v
coverage report -m
```

---

## 5. Pull Request Process

1. Create a descriptive feature branch: `git checkout -b feat/add-bluesky-monitor` or `fix/connection-pool-leak`.
2. Ensure all tests pass (`100% OK`).
3. Commit with clear, conventional commit messages: `feat: add Bluesky monitor provider`, `fix: enforce constant-time webhook authentication`.
4. Open a Pull Request against the `main` branch with a summary of changes and validation results.
