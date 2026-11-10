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
# GIT_SHA is referenced inside RUN below. When it changes, the RUN
# layer hash changes, so the cache is forcibly invalidated on every
# deploy. This is the mechanism that makes "clean rebuilds" actually
# clean, independent of Docker's layer cache.
ARG GIT_SHA=unknown

ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL \
    NEXT_PUBLIC_HTTP_PROTOCOL=$NEXT_PUBLIC_PROTOCOL \
    GIT_SHA=$GIT_SHA

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -z "$NEXT_PUBLIC_ROOT_DOMAIN" ]; then \
      echo "WARN: NEXT_PUBLIC_ROOT_DOMAIN is empty at build time — cross-subdomain links will use path mode."; \
    fi \
    && echo "  NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN" \
    && echo "  GIT_SHA=$GIT_SHA"

# ═══════════════════════════════════════════════════════════════════
# WHY THE CACHE MOUNT WAS REMOVED
# ───────────────────────────────────────────────────────────────────
# The previous form of this RUN was:
#     RUN --mount=type=cache,target=/app/.next/cache \
#         NODE_OPTIONS="--max-old-space-size=1024" \
#         npm run build
#
# BuildKit treats cache mounts as INDEPENDENT of the layer cache.
# That means:
#     docker build --no-cache →  clears layers, NOT the cache mount
#     docker compose build --no-cache →  same
#
# So every "clean rebuild" was silently reusing /app/.next/cache from
# the previous build. Next.js's incremental compiler has known gaps
# around deleted/renamed modules: the old chunk can survive in the
# bundle even though its source file is gone. That is why pushing,
# rebuilding, and recreating the container still shipped the old code.
#
# Trade-off: builds are ~2-4 min slower. That is the right trade for
# a production image whose byte content must match the source tree.
# If you want the speed back later, use a *safe* cache like
# `--mount=type=cache,target=/root/.npm` (downloaded packages) — never
# `/app/.next/cache`.
# ═══════════════════════════════════════════════════════════════════
RUN echo "==> Building GIT_SHA=$GIT_SHA" \
    && NODE_OPTIONS="--max-old-space-size=1024" npm run build \
    && test -f .next/standalone/server.js \
    && test -f .next/BUILD_ID \
    && echo "==> .next/BUILD_ID=$(cat .next/BUILD_ID)"

# ── prod ─────────────────────────────────────────────────────────────
FROM node:22.11-alpine3.20 AS prod
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Same value as the builder stage — used only for verification.
ARG GIT_SHA=unknown
ENV GIT_SHA=$GIT_SHA

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

# Verification file. On the VPS:
#     docker exec next-js cat /app/BUILD_INFO
# If git_sha does not match `git rev-parse origin/main`, the deployed
# image is stale and the deploy workflow has a bug.
RUN echo "git_sha=$GIT_SHA" > /app/BUILD_INFO && \
    echo "build_id=$(cat .next/BUILD_ID)" >> /app/BUILD_INFO && \
    echo "built_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /app/BUILD_INFO

EXPOSE 3000
CMD ["node", "server.js"]
