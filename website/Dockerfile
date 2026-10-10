FROM node:22.11-alpine3.20 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# ── deps ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# ── builder ──────────────────────────────────────────────────────────
FROM base AS builder

# Next.js inlines NEXT_PUBLIC_* at BUILD time. These must be present
# during `npm run build` — setting them at runtime has no effect.
ARG NEXT_PUBLIC_ROOT_DOMAIN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PROTOCOL=https
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# V8 heap cap. This box has 2 GB physical RAM. The previous value
# (--max-old-space-size=3072) let V8 grow past physical memory, forcing
# the kernel into swap and turning a ~5-minute build into ~1 hour.
# 1024 keeps V8 GCing aggressively instead.
# The cache mount persists .next/cache across runs, so unchanged pages
# skip recompilation. Requires BuildKit (default in Docker 23+).
RUN --mount=type=cache,target=/app/.next/cache \
    NODE_OPTIONS="--max-old-space-size=1024" \
    npm run build

# ── prod ─────────────────────────────────────────────────────────────
FROM node:22.11-alpine3.20 AS prod
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
