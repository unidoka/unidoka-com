#!/usr/bin/env bash
set -euo pipefail

mkdir -p "letsencrypt"

# ── /docker-compose.yml ──────────────────────────────────────────────
cat << '__LARAVEL_EOF__' > "docker-compose.yml"
name: laravel-app

services:
  traefik:
    image: traefik:latest
    container_name: traefik
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=${ACME_EMAIL:-hi@example.com}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--api.insecure=${TRAEFIK_API_INSECURE:-false}"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - main-network
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app
    env_file: ./.env
    environment:
      - DB_HOST=db
      - REDIS_HOST=valkey
    volumes:
      - ./:/app
      - app_vendor:/app/vendor
      - app_storage:/app/storage
    depends_on:
      db:
        condition: service_healthy
      valkey:
        condition: service_healthy
    networks:
      - main-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8000/ >/dev/null || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 60s
    labels:
      - "traefik.enable=true"
      # DOMAIN in .env IS the full Traefik matcher, e.g.
      #   Host(`localhost`) || HostRegexp(`^[a-z0-9-]+\.localhost$`)
      # Use it verbatim. Do NOT wrap it in Host(...) here — that nests
      # one matcher inside another and Traefik rejects the rule.
      - "traefik.http.routers.app.rule=${DOMAIN}"
      - "traefik.http.routers.app.entrypoints=${ENTRYPOINT:-websecure}"
      - "traefik.http.routers.app.tls=${TLS_ENABLED:-true}"
      - "traefik.http.routers.app.tls.certresolver=${CERT_RESOLVER:-myresolver}"
      - "traefik.http.services.app.loadbalancer.server.port=8000"

  db:
    image: postgres:15-alpine
    container_name: db
    env_file: ./.env
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - main-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  valkey:
    image: valkey/valkey:7-alpine
    container_name: valkey
    command: valkey-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    networks:
      - main-network
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

networks:
  main-network:
    name: main-network
    driver: bridge

volumes:
  db_data:
  app_vendor:
  app_storage:
__LARAVEL_EOF__

# ── /Dockerfile ──────────────────────────────────────────────────────
cat << '__LARAVEL_EOF__' > "Dockerfile"
# syntax=docker/dockerfile:1.7

# FrankenPHP bundles Caddy + PHP-FPM in one binary, so the app ships as a
# single container. Same shape as the FastAPI Dockerfile: install deps,
# copy code, migrate + serve from CMD. No separate nginx service, no
# supervisor, no supervisor.conf to maintain.
FROM dunglas/frankenphp:1-php8.3-alpine

# OS-level packages composer needs at build time on Alpine:
#   ca-certificates — Alpine's base image ships without a CA bundle, so
#                     every HTTPS request to packagist fails TLS
#                     verification. Composer reports this as exit 2 with
#                     a "could not download file" message.
#   git, unzip      — composer clones (prefer-source) and extracts dist
#                     archives (prefer-dist). Without them, extraction
#                     fails silently and install aborts mid-flight.
RUN apk add --no-cache ca-certificates git unzip

# install-php-extensions is shipped by the FrankenPHP base image.
# `@composer` is a special alias that installs the Composer binary.
RUN install-php-extensions \
        pdo_pgsql \
        pgsql \
        intl \
        zip \
        bcmath \
        pcntl \
        opcache \
        redis \
        @composer

# php.ini overrides — inlined so the whole stack is exactly two files.
# OPcache validates timestamps so bind-mounted edits take effect on the
# next request during development. For prod, flip validate_timestamps=0.
RUN cat > /usr/local/etc/php/conf.d/99-app.ini <<'PHPINI'
memory_limit = 256M
upload_max_filesize = 32M
post_max_size = 32M
max_execution_time = 60
max_input_time = 60

opcache.enable = 1
opcache.enable_cli = 0
opcache.validate_timestamps = 1
opcache.revalidate_freq = 0
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
opcache.interned_strings_buffer = 16

display_errors = Off
log_errors = On
error_log = /dev/stderr
PHPINI

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    # Composer's SAT solver hits the CLI memory_limit during dependency
    # resolution of a fresh Laravel tree. -1 means unlimited; without it,
    # exit 2 with "Allowed memory size of 268435456 bytes exhausted".
    COMPOSER_MEMORY_LIMIT=-1

# Deps first so this layer caches across code edits.
#
# Three things this block has to survive:
#   1. A fresh checkout with NO composer.lock — the `*` in
#      `composer.lock*` makes that file optional for COPY.
#   2. A stale composer.lock that disagrees with composer.json — install
#      refuses to re-resolve and exits 2; update is what fixes it.
#   3. Anything else — `--verbose` is on so the real composer error is
#      printed to stdout instead of being swallowed by the `||` fallback.
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --verbose \
    || (echo '=== composer install failed — retrying with composer update ===' >&2 \
        && composer update --no-dev --no-scripts --no-autoloader --prefer-dist --verbose)

# Application code.
COPY ./ /app/

# Optimized autoloader + writable runtime dirs.
RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

# Run migrations, then serve. Mirrors the FastAPI service's
# `alembic upgrade head && uvicorn ...` startup contract.
CMD ["sh", "-c", "php artisan migrate --force && frankenphp php-server --root public/ --listen :8000"]
__LARAVEL_EOF__

# ── /.env.example ────────────────────────────────────────────────────
cat << '__ENV_EOF__' > ".env.example"
# ══════════════════════════════════════════════════════════════════
#  Shared .env — read by docker-compose for the whole stack.
#  Laravel reads these as real process env vars (env() / $_ENV), so no
#  .env file is needed inside the app container. Compose's env_file
#  wins over Laravel's Dotenv (Dotenv is immutable by default).
#
#  First run:
#    cp .env.example .env
#    docker compose run --rm app php artisan key:generate --show
#    # paste printed base64:... into APP_KEY below
#    docker compose up -d --build
# ══════════════════════════════════════════════════════════════════

# ── Application ───────────────────────────────────────────────────
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:CHANGE_ME
APP_DEBUG=false
APP_URL=https://localhost
APP_TIMEZONE=UTC

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4
BCRYPT_ROUNDS=12

# ── Logging ───────────────────────────────────────────────────────
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# ── PostgreSQL ────────────────────────────────────────────────────
# DB_HOST is force-overridden to `db` in docker-compose.yml, but keep
# it correct here so artisan works when run outside the compose net.
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=laravel
DB_USER=laravel
DB_PASSWORD=change-me-in-production

# ── Valkey (Redis-compatible) ─────────────────────────────────────
# phpredis is the extension installed in the Dockerfile.
REDIS_CLIENT=phpredis
REDIS_HOST=valkey
REDIS_PORT=6379
REDIS_PASSWORD=change-me-in-production
REDIS_DB=0
REDIS_CACHE_DB=1

# ── Session / Cache / Queue ───────────────────────────────────────
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_STORE=redis
# CACHE_PREFIX=

QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local

MEMCACHED_HOST=127.0.0.1

# ── Mail ──────────────────────────────────────────────────────────
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# ── AWS (unused, kept for parity with Laravel defaults) ───────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# ── Frontend ──────────────────────────────────────────────────────
VITE_APP_NAME="${APP_NAME}"

# ── Traefik ───────────────────────────────────────────────────────
# DOMAIN is the FULL Traefik router matcher. docker-compose.yml injects
# it verbatim into `traefik.http.routers.app.rule=` — no Host() wrapper
# on the compose side, or the matchers nest and Traefik rejects the rule.
#
# SINGLE QUOTES ARE REQUIRED. dotenv does no escape processing inside
# single quotes, so the backslash in `\.localhost` reaches Traefik
# intact. Double quotes make the dotenv parser choke on `\.` as an
# invalid escape sequence.
DOMAIN='Host(`localhost`) || HostRegexp(`^[a-z0-9-]+\.localhost$`)'
ENTRYPOINT=websecure
TLS_ENABLED=true
CERT_RESOLVER=myresolver
ACME_EMAIL=hello@example.com
TRAEFIK_API_INSECURE=false
__ENV_EOF__

# ── /.dockerignore ───────────────────────────────────────────────────
cat << '__LARAVEL_EOF__' > ".dockerignore"
.git
.gitignore

.env
.env.*
!.env.example

letsencrypt/

# Composer — installed inside the image, never copied from the host.
vendor/

# Laravel runtime + build artifacts — regenerated in the container.
storage/logs/*
storage/framework/cache/data/*
storage/framework/sessions/*
storage/framework/views/*
bootstrap/cache/*.php

node_modules/
public/build/
public/hot
public/storage

Dockerfile
docker-compose.yml

.idea
.vscode
.DS_Store
*.log
repomix*
aider*
__LARAVEL_EOF__

# ── /.gitignore ──────────────────────────────────────────────────────
cat << '__LARAVEL_EOF__' > ".gitignore"
# env
.env
.env.*
!.env.example

# traefik
letsencrypt/

# laravel runtime
/vendor
/storage/logs/*
/storage/framework/cache/data/*
/storage/framework/sessions/*
/storage/framework/views/*
/bootstrap/cache/*.php
/public/build
/public/hot
/public/storage
/node_modules
*.log

# ide / os
.idea
.vscode
.DS_Store

# misc
repomix*
aider*
__LARAVEL_EOF__

echo "done — 5 files written at root"