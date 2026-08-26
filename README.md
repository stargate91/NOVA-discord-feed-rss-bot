# Nova Feed Bot

Nova Feed Bot is a high-throughput, multi-tenant Discord notification aggregator and ingestion platform engineered for high-concurrency deployments. The system monitors multiple external content providers (YouTube, Twitch, Steam, RSS feeds, Reddit, TMDB, and cryptocurrency networks), deduplicates incoming events, and dispatches rich embed notifications to configured Discord channels across thousands of servers with rate-limit protection and sub-millisecond database queries.

---

## Key Capabilities

- **Multi-Tenant Ingestion Pipeline**: Concurrent feed polling orchestrator with dynamic, tier-based polling intervals and shared-group deduplication.
- **Provider Support**: Native monitor implementations for YouTube, Twitch, Steam News, Epic Games Free Games, RSS/Atom feeds, TMDB (Movies & TV), and Cryptocurrency price alerts.
- **Decoupled Microservices**: Supports running as an all-in-one monolith or as three independently scalable microservices (Discord Gateway Worker, Feed Ingestion Worker, and FastAPI REST Worker) coordinated via asynchronous message queues.
- **Hybrid Data Architecture**: Combines SQLAlchemy 2.0 declarative schema definitions and Alembic migrations with low-latency binary `asyncpg` queries for high-volume deduplication.
- **Thread-Safe Bounded Caching**: Synchronized LRU caches with strict capacity limits and TTL auto-eviction to ensure bounded memory usage in large-scale bot deployments.
- **Circuit Breaker Delivery**: In-memory dead-channel blacklist with automatic sweep to insulate the bot from Discord API 404/403 rate-limit starvation.
- **Enterprise Stripe Billing**: Complete webhook integration for checkout completion, tier upgrades, renewals, and cancellations, equipped with idempotency checks and payment audit logging.
- **Observability & Telemetry**: Built-in Prometheus `/metrics` exposition, in-memory sliding-window log buffer with keyword filtering, and structured JSON logging.
- **Internationalization**: Full localization support across 17 languages with configurable default fallback and variable interpolation.

---

## Architecture Overview

Nova is designed around a clean Composition Root (`BotContainer`) that wires dependencies in topological order, avoiding circular imports and monolithic god objects.

```
                              +---------------------------------------+
                              |    Feed Worker (Ingestion Poller)     |
                              |         (Scales 1..N Pods)            |
                              +-------------------+-------------------+
                                                  |
                                         BroadcastPayload
                                                  |
                                                  v
                               +--------------------------------------+
                               |      Redis Notification Queue        |
                               |      (or In-Memory Dev Queue)        |
                               +------------------+-------------------+
                                                  |
                                           Pulls Payload
                                                  |
                                                  v
+------------------------------------+   +------------------------------------+
|     API Worker (FastAPI Server)    |   |   Gateway Worker (Discord Client)  |
|  - Health checks & DB telemetry    |   |  - WebSocket heartbeat connection  |
|  - Stripe webhooks & Idempotency   |   |  - Slash commands & App commands   |
|  - Prometheus /metrics endpoint    |   |  - Message delivery & embed format |
+------------------------------------+   +------------------------------------+
```

### Execution Modes

The application entrypoint (`main.py`) supports three execution strategies:

1. **Monolith (`--mode all`)**: Runs the Discord Gateway client, Feed Ingestion Scheduler, and FastAPI Webhook server within a single runtime process (ideal for local development and single-node setups).
2. **Gateway Worker (`--mode gateway`)**: Runs only the Discord WebSocket client and queue consumer worker.
3. **Feed Worker (`--mode feed`)**: Runs only the Polling Scheduler and Ingestion Pipeline, pushing publish payloads to the message queue.
4. **API Worker (`--mode api`)**: Runs only the FastAPI web server, handling health checks, admin management endpoints, and Stripe billing webhooks.

---

## Technology Stack

- **Runtime**: Python 3.11+ / Python 3.12 (CPython / Free-Threaded compatible)
- **Discord Gateway**: `discord.py` 2.3+
- **Web API**: FastAPI, Starlette, Uvicorn
- **Database**: PostgreSQL 16+, `asyncpg` (Binary Protocol Driver), SQLAlchemy 2.0, Alembic
- **Distributed Queue & Cache**: Redis 7+ (`redis-py`)
- **Domain Modeling**: Pydantic v2
- **Testing & QA**: Pytest, Pytest-Asyncio, Coverage, Ruff, Pip-Audit
- **Orchestration**: Docker Compose, Kubernetes, Kustomize

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 16+ instance
- Redis 7+ instance (optional for local monolith mode; required for distributed cluster mode)
- Discord Bot Token with Server Members and Message Content intents enabled
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/stargate91/discord-feed-bot.git
   cd discord-feed-bot
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   # Production runtime only:
   pip install -r requirements.txt

   # Development, testing, and linting tools:
   pip install -r requirements-dev.txt
   ```

### Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DISCORD_TOKEN` | Discord Bot Application Token | *(Required)* |
| `BOT_PREFIX` | Command prefix for legacy text commands | `!` |
| `DATABASE_URL` | PostgreSQL connection DSN (`postgresql+asyncpg://...`) | *(Required)* |
| `REDIS_URL` | Redis instance connection URL | `redis://localhost:6379/0` |
| `QUEUE_BACKEND` | Queue provider (`memory` or `redis`) | `memory` |
| `WEBHOOK_HOST` | FastAPI server listening interface | `0.0.0.0` |
| `WEBHOOK_PORT` | FastAPI server listening port | `8080` |
| `WEBHOOK_SECRET` | Secret token protecting admin and metric endpoints | *(Required in prod)* |
| `STRIPE_API_KEY` | Stripe Secret API Key (`sk_live_...` or `sk_test_...`) | *(Optional)* |
| `STRIPE_WEBHOOK_SECRET` | Stripe HMAC Webhook signing secret (`whsec_...`) | *(Optional)* |

---

## Database Migrations

Nova utilizes Alembic with asynchronous connection support. The migration environment dynamically parses the database connection URL from environment variables.

1. Apply all pending database migrations:
   ```bash
   alembic upgrade head
   ```

2. Generate a new migration revision based on declarative schema changes:
   ```bash
   alembic revision --autogenerate -m "describe_schema_changes"
   ```

3. Rollback the most recent migration:
   ```bash
   alembic downgrade -1
   ```

---

## Running the Application

### Local Development

Run the full monolith service locally:
```bash
python main.py --mode all
```

Run dedicated microservice workers individually:
```bash
# Terminal 1: Discord Gateway Client
python -m workers.gateway_worker

# Terminal 2: Feed Ingestion Pipeline
python -m workers.feed_worker

# Terminal 3: REST API & Webhooks
python -m workers.api_worker
```

### Docker Compose

#### Staging Environment
```bash
docker compose -f docker-compose.staging.yml up --build -d
```

#### Production Distributed Cluster
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Kubernetes Deployment

Kubernetes manifests are organized under the `k8s/` directory and managed via Kustomize:

```bash
# Review rendered manifest configuration
kubectl kustomize k8s/

# Apply manifests to the target cluster
kubectl apply -k k8s/
```

The Kubernetes setup includes:
- Isolated `nova-bot` namespace
- Non-root Gateway Pod with `Recreate` deployment strategy
- Feed Worker Pods with Horizontal Pod Autoscaler (HPA: 2-10 replicas)
- API Worker Pods with Liveness/Readiness HTTP probes (HPA: 2-8 replicas)
- Nginx Ingress Controller definition with TLS termination

---

## Testing & Quality Assurance

Nova enforces strict code quality gates with 100% passing test suites and zero linter warnings.

### Running Tests

Execute the automated test suite with verbose output:
```bash
pytest -v
```

Run tests with test coverage reporting:
```bash
coverage run -m pytest -v
coverage report -m
coverage html
```

### Static Analysis & Linting

Verify repository cleanliness with Ruff:
```bash
python -m ruff check .
```

### Supply Chain Security Audit

Scan third-party dependencies for known vulnerabilities:
```bash
pip-audit -r requirements.txt
```

---

## REST API Reference

The FastAPI web service exposes health check, administration, and Stripe billing endpoints:

### Public Endpoints
- `GET /health` : Liveness probe checking application uptime and PostgreSQL ping latency.
- `GET /docs` : Interactive OpenAPI Swagger documentation UI.
- `GET /openapi.json` : Machine-readable OpenAPI 3.1 contract specification.

### Admin Endpoints (Protected via `X-Webhook-Secret` or `Authorization: Bearer <secret>`)
- `GET /metrics` : Prometheus exposition format containing delivery counters, queue depths, and cache statistics.
- `GET /api/v1/admin/logs` : Query ring buffer logs with level and text filtering.
- `GET /api/v1/admin/metrics` : Summary JSON telemetry data.
- `POST /api/v1/monitors/sync` : Force monitor reload and synchronization from database.
- `POST /api/v1/monitors/check` : Trigger on-demand manual check for a specific monitor.
- `GET /api/v1/guilds/{guild_id}/permissions/{user_id}` : Query Discord user administrative entitlements for a guild.

### Billing & Stripe Webhook
- `POST /stripe/webhook` : HMAC signature verified webhook listener for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events. Includes idempotency check to prevent duplicate grant operations.
- `GET /checkout?guild_id={id}&tier={1|2|3}&interval={mo|yr}` : Generates a Stripe Checkout session and redirects to payment portal.

---

## Architecture Decision Records (ADRs)

Formal design choices and engineering rationale are cataloged in [docs/adr/](docs/adr/):

- **[ADR-0001](docs/adr/0001-hybrid-database-access-asyncpg-and-sqlalchemy.md)**: Hybrid Database Access: asyncpg High-Throughput & SQLAlchemy Declarative Migrations.
- **[ADR-0002](docs/adr/0002-decoupled-microservices-and-worker-architecture.md)**: Decoupled Microservices & Worker Architecture (Gateway, Feed, API).
- **[ADR-0003](docs/adr/0003-thread-safe-bounded-lru-caching.md)**: Thread-Safe Bounded LRU & Shared Feed Caching Strategy.
- **[ADR-0004](docs/adr/0004-composition-root-and-dependency-injection.md)**: Centralized Composition Root (`BotContainer`) & Cog Decomposition.
- **[ADR-0005](docs/adr/0005-resilient-dead-channel-circuit-breaker.md)**: In-Memory Dead Channel Circuit Breaker for Rate-Limit Isolation.

---

## License

Copyright (c) 2026 Levi. All Rights Reserved.

This software is published under a proprietary, source-available license for inspection, review, and educational reference only. Modification, redistribution, sublicensing, deployment, commercial use, and incorporation into any other product or repository are strictly prohibited without express prior written permission from the copyright holder. See [LICENSE](LICENSE) for the full terms and conditions.
