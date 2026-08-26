# ==============================================================================
# Multi-stage Production Dockerfile for Nova Discord Feed Bot
# ==============================================================================

# Stage 1: Build & Dependencies
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Minimal Distroless/Slim Production Runtime
FROM python:3.12-slim AS runner

WORKDIR /app

# Install runtime dependencies for health checks & PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Security: Create non-root user and group
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Copy installed wheels/dependencies from builder stage
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy application source code
COPY --chown=appuser:appgroup . .

# Ensure data directory has proper permissions
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

USER appuser

# Expose internal Webhook and REST API port
EXPOSE 8080

# Health check probe against the FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default execution mode: Monolith (API + Gateway Bot + Feed Pipeline)
CMD ["python", "main.py", "--mode", "all"]
