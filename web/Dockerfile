# ==============================================================================
# Stage 1: Build & Static Asset Generation (Multi-Environment)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build Arguments with Sensible Defaults
ARG VITE_API_URL=""
ARG VITE_MOCK_AUTH="false"
ARG VITE_USE_MOCK_DATA="false"
ARG NODE_ENV="production"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MOCK_AUTH=$VITE_MOCK_AUTH
ENV VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA
ENV NODE_ENV=$NODE_ENV

# Install dependencies using package-lock.json for deterministic builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and configuration
COPY . .

# Build production bundle and pre-render multi-language static shells
RUN npm run build

# ==============================================================================
# Stage 2A: Staging Runner
# ==============================================================================
FROM nginx:1.27-alpine AS staging
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# ==============================================================================
# Stage 2B: Production Hardened Nginx Runner
# ==============================================================================
FROM nginx:1.27-alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# Default target
FROM production AS runner
