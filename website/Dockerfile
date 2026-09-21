# ===============================
# Base
# ===============================
FROM node:lts-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ===============================
# Dependencies
# ===============================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ===============================
# Build
# ===============================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===============================
# Prod
# ===============================
FROM node:lts-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
