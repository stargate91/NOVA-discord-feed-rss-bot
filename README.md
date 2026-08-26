# Nova Feed Bot

Nova is a high-performance, asynchronous feed monitoring and notification delivery platform designed for Discord communities. Built on a modular microservices architecture, Nova allows organizations to ingest updates from multiple platforms (YouTube, Twitch, GitHub, Steam, RSS feeds, TMDB, Cryptocurrency markets) and broadcast them to configured Discord channels with rate-limit protection, entitlement tiers, real-time observability, and an integrated web management dashboard.

---

## Architectural Overview

Nova is designed around decoupled components connected via asynchronous interfaces, message queues, and REST APIs. It supports both single-process standalone deployment and horizontally scalable multi-process worker pools alongside a modern Next.js management dashboard.

```
                           +--------------------------------------+
                           |          Web Management App          |
                           |   (Next.js / React 19 / TypeScript)  |
                           +--------------------------------------+
                                             |
                                    REST API / NextAuth
                                             |
                                             v
                           +--------------------------------------+
                           |          FastAPI Web Server          |
                           |   (Dashboard / Webhooks / Metrics)   |
                           +--------------------------------------+
                                             |
+---------------------+     +-------------------------------+     +-----------------------+
| Ingestion Engine    | --> |      Notification Queue       | --> | Discord Gateway Bot   |
| (Monitors / Feeds)  |     |       (Redis / Memory)        |     | (Delivery / Sharding) |
+---------------------+     +-------------------------------+     +-----------------------+
         |                                                                    |
         +--------------------------+                       +-----------------+
                                    |                       |
                                    v                       v
                            +-----------------------------------------------+
                            |            PostgreSQL Database                |
                            |       (SQLAlchemy 2.0 / asyncpg / Alembic)    |
                            +-----------------------------------------------+
```

### Key Architectural Layers

1. **Ingestion Engine (`engine/`, `monitors/`)**:
   - Implements a unified `BaseMonitor` interface for periodic polling and event extraction.
   - Completely decoupled from Discord API tokens and network sessions.
   - Dispatches structured events to the delivery layer via strongly typed domain models.

2. **Delivery & Queue Layer (`services/queue_service.py`, `services/queue_delivery_adapter.py`)**:
   - `MemoryNotificationQueue`: In-memory asynchronous queue for single-process deployments and automated testing.
   - `RedisNotificationQueue`: Distributed queue (`LPUSH` / `BRPOP`) for clustered deployments.
   - `QueueConsumerWorker`: Pulls queued broadcast payloads and forwards them to destination adapters.

3. **Discord Gateway Service (`core/bot.py`, `services/discord_delivery_adapter.py`)**:
   - Manages Discord Gateway connection and slash command registration.
   - Implements dead-channel circuit breaking to prevent repeated API calls to deleted channels.
   - Formats embeds, links, and action buttons dynamically based on guild settings.

4. **API & Management Server (`core/webhook_server.py`, `api/routers/`)**:
   - Modular FastAPI routing for Stripe billing webhooks, monitor administration, and guild configuration.
   - Real-time observability: in-memory ring buffer log inspection and Prometheus metric exposition.

5. **Web Management Dashboard (`web/`)**:
   - Next.js web application built with React 19 and TypeScript.
   - Authenticates server administrators via Discord OAuth2 (NextAuth.js).
   - Provides granular monitor controls, live delivery metrics, theme personalization, and subscription management.

6. **Data Persistence & Domain Layer (`db/`, `models/`)**:
   - Declarative SQLAlchemy 2.0 Async schema with full Alembic migration tracking.
   - Strongly typed domain contracts using Pydantic v2.

---

## Technology Stack

### Backend & Core
- **Runtime**: Python 3.11+
- **Discord Framework**: discord.py 2.3+
- **Web & API Framework**: FastAPI, Starlette, Uvicorn
- **Data Validation & Typing**: Pydantic v2, Pydantic-Settings
- **ORM & Database**: SQLAlchemy 2.0 Async, asyncpg, Alembic
- **Distributed Queue**: Redis (aioredis)
- **HTTP Client**: aiohttp, httpx
- **Testing**: Pytest, Pytest-Asyncio

### Frontend (Web Dashboard)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, TypeScript
- **Authentication**: NextAuth.js (Discord OAuth2 Provider)
- **Styling**: CSS Modules, CSS Variables (Dark theme design system)
- **Visualization**: Recharts (Feed volume and delivery latency charts)
- **Payments**: Stripe Elements and Customer Portal

---

## Execution Modes

Nova provides multiple operational modes managed through command-line arguments or environment variables:

### 1. Unified Standalone Mode (Default)
Runs the Discord bot, feed ingestion scheduler, and FastAPI webhook server inside a single process. Recommended for development, testing, and standard server instances.

```bash
python main.py --mode=all
```

### 2. Standalone API Server
Runs only the FastAPI HTTP server for web dashboards, Stripe billing webhooks, log streaming, and Prometheus metrics.

```bash
python main.py --mode=api
```

### 3. Standalone Ingestion Worker
Runs only the feed polling and ingestion pipeline. Discovered updates are enqueued into Redis without establishing any Discord gateway connections.

```bash
python main.py --mode=worker
```

### 4. Standalone Gateway Consumer
Connects to the Discord Gateway, pulls items from the notification queue, and delivers formatted messages to Discord channels.

```bash
python main.py --mode=gateway
```

---

## Installation & Deployment

### Quick Start with Docker & Docker Compose (Recommended)

The easiest and most reliable way to run Nova in production with PostgreSQL and Redis:

1. **Clone the repository and prepare environment configuration**:
   ```bash
   git clone https://github.com/stargate91/discord-feed-bot.git
   cd discord-feed-bot
   cp .env.example .env
   # Edit .env with your BOT_TOKEN, WEBHOOK_SECRET, and API keys
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
   This starts:
   - **PostgreSQL 16** (Database with persistent volume and healthcheck)
   - **Redis 7** (Distributed queue & caching)
   - **Nova Bot & API Server** (Multi-stage container with non-root security and `/health` probe)

3. **Check container health & logs**:
   ```bash
   docker compose ps
   docker compose logs -f bot
   ```

---

### Manual Python Installation

1. **Clone and create virtual environment**:
   ```bash
   git clone https://github.com/stargate91/discord-feed-bot.git
   cd discord-feed-bot
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Install deterministic pinned dependencies:
   pip install -r requirements.lock
   ```

2. **Configure Environment Variables (`.env`)**:
   ```bash
   cp .env.example .env
   ```

3. **Run Database Migrations & Initial Setup**:
   ```bash
   alembic upgrade head
   ```

4. **Start Nova Bot**:
   ```bash
   python main.py --mode=all
   ```

---

### Frontend Dashboard Setup

The web dashboard is located in the `web/` directory.

1. **Navigate to the web folder and install dependencies**:
   ```bash
   cd web
   npm install
   ```

2. **Configure Frontend Environment Variables (`web/.env.local`)**:
   ```ini
   # App URL
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Discord OAuth2 Application
   DISCORD_CLIENT_ID=your_discord_application_client_id
   DISCORD_CLIENT_SECRET=your_discord_application_client_secret

   # Backend API Connection
   NEXT_PUBLIC_API_URL=http://localhost:8080
   INTERNAL_API_SECRET=your_webhook_secret_key

   # PostgreSQL Connection (for direct server-side data fetching)
   DATABASE_URL=postgresql://nova_user:nova_password@localhost:5432/nova_db

   # Stripe Public Key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

---

## Web Dashboard Features & Routing

| Route | Purpose | Key Functionality |
| :--- | :--- | :--- |
| `/` | Landing Page | Feature showcase, pricing plans, live statistics, bot invite link |
| `/servers` | Server Selector | Guild list where the authenticated user has administrative privileges |
| `/dashboard/[guildId]` | Server Management | Feed configuration, target channel binding, custom embeds, manual trigger checks |
| `/premium` | Premium Management | Tier overview, Stripe checkout integration, subscription renewal status |
| `/privacy`, `/terms` | Legal & Compliance | Privacy policy and terms of service documents |

---

## Monitoring and Observability

Nova includes built-in observability endpoints accessible via HTTP:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | GET | Basic health check for load balancers and container orchestrators |
| `/metrics` | GET | Standard Prometheus exposition format for scrapers |
| `/api/admin/metrics` | GET | JSON metric summary including counter totals, latencies, and uptime |
| `/api/admin/logs` | GET | Filtered circular buffer logs for admin dashboards (`level`, `guild_id`, `platform`, `search`) |

---

## Testing

The test suite covers unit logic, repository mappings, ORM schemas, delivery adapters, ring buffer filters, and end-to-end integration flows:

```bash
python -m pytest
```

To run a specific test module:

```bash
python -m pytest tests/test_worker_queue_and_microservices.py
python -m pytest tests/test_database_orm_and_migrations.py
python -m pytest tests/test_structured_logging_and_metrics.py
```

---

## License

Copyright (c) 2026. All Rights Reserved.

This repository and its source code are proprietary. Viewing the codebase is permitted for review purposes, but no part of this project may be copied, modified, distributed, sublicensed, or used commercially without prior explicit written permission from the copyright owner.
