# ── Builder ──────────────────────────────────────────────────────────
# Any dependency without a manylinux wheel for this Python/arch combo
# lands here and gets compiled. Includes the toolchain for the classic
# culprits (bcrypt via Rust, psycopg2 via libpq headers, cryptography
# via libssl/libffi). This stage is discarded after install.
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libffi-dev \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# `--prefix=/install` isolates the resulting package tree so the runtime
# stage can copy exactly it — no pip cache, no build tooling, no source.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Runtime ──────────────────────────────────────────────────────────
# Bare slim image + the shared libraries the compiled wheels link
# against at import time. libpq5 is the runtime half of the libpq-dev
# pair that psycopg2 was built against.
FROM python:3.12-slim AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Pull the fully-built site-packages into the system Python's search
# path. Anything pip installed under /install lands here.
COPY --from=builder /install /usr/local

# Application source. `.dockerignore` keeps the context lean — no
# venvs, no caches, no storage/ volume, no VCS metadata.
COPY ./ /app/

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
