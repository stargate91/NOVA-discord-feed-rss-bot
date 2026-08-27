# ==============================================================================
# Stage 1: Build & Static Asset Generation
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using package-lock.json for deterministic builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and configuration
COPY . .

# Build production bundle and pre-render multi-language static shells
ENV NODE_ENV=production
RUN npm run build

# ==============================================================================
# Stage 2: Production Nginx Server
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
