# Unidoka

Fullstack monorepo — FastAPI backend + Next.js frontend, wired for
one-command local dev and one-command prod deploy.

## Files structure

```text
/
├── backend/
│   ├── services/
│   │   └── main-service/
│   │       ├── app/               # FastAPI source
│   │       ├── alembic/           # migrations
│   │       ├── Dockerfile
│   │       └── .dockerignore      # slim build context for main-service
│   ├── docker-compose.yml         # base: main-service, main-db, valkey
│   ├── docker-compose.dev.yml     # dev override: source mount + hot reload
│   ├── seed_events.sql            # events taxonomy seed (post-migration)
│   └── README.md
├── website/
│   ├── app/                       # Next.js App Router
│   ├── components/                # shadcn/ui + custom
│   ├── public/
│   │   └── order_files/           # bind-mounted at runtime (see Image optimization)
│   ├── Dockerfile                 # multi-stage, `prod` target → standalone
│   ├── docker-compose.yml         # prod next-js ONLY
│   ├── .dockerignore              # slim build context for the frontend image
│   └── README.md
├── .github/workflows/deploy.yml   # CI: build on runner, ship image to VPS
├── docker-compose.yml             # root: traefik + include backend + website
├── docker-compose.dev.yml         # root: backend + dev next-js (no traefik)
├── .env.example
├── .gitignore
├── .repomixignore
├── AGENTS.md
└── README.md
```

The root files are the entry points. Each root file `include`s the
per-folder files so the full service list lives with the code it
describes, not in one giant monolith.

## Quick start

### Development

All services run in Docker. Hot reload is on for both FastAPI
(`uvicorn --reload`) and Next.js (`next dev`). No Traefik: the browser
talks to Next.js on `:3000`, and Next.js proxies `/api/v1/*`, `/docs`,
and `/health` to `main-service` inside the Docker network — same-origin
API, no CORS, no cross-origin cookie issues.

```bash
# 1. Env — DB password, JWT secret, SMTP creds, ...
cp .env.example .env

# 2. Bring up all services
docker compose -f docker-compose.dev.yml up -d --build

# 3. Apply migrations (first run, or after pulling new migrations)
docker compose -f docker-compose.dev.yml exec main-service alembic upgrade head
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000/docs

Logs:

```bash
docker compose -f docker-compose.dev.yml logs -f next-js
docker compose -f docker-compose.dev.yml logs -f main-service
```

Stop the dev stack (keeps volumes):

```bash
docker compose -f docker-compose.dev.yml down
```

Wipe the dev DB too:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Production

Everything runs in Docker, behind Traefik, with automatic Let's Encrypt
TLS. The Next.js frontend is built as an optimized standalone image and
served from the `next-js` container.

```bash
# 1. Env — set DOMAIN, MAIN_DB_PASSWORD, JWT_SECRET_KEY, MAIL_*, ...
cp .env.example .env

# 2. Bring everything up
docker compose --profile prod up -d --build

# 3. Apply migrations (first run only)
docker compose --profile prod exec main-service alembic upgrade head
```

| Service | Role | Source file |
|---|---|---|
| `traefik` | Reverse proxy + TLS | `docker-compose.yml` |
| `main-service` | FastAPI (`/api/v1`, `/docs`, `/health`) | `backend/docker-compose.yml` |
| `main-db` | PostgreSQL 15 | `backend/docker-compose.yml` |
| `valkey` | Cache / rate limits / OTPs | `backend/docker-compose.yml` |
| `next-js` | Next.js standalone | `website/docker-compose.yml` |

Stop prod:

```bash
docker compose --profile prod down
```

## Why files are split this way

| File | Contains | Included by |
|---|---|---|
| `docker-compose.yml` | Traefik only | — |
| `docker-compose.dev.yml` | Dev Next.js (`next dev`) | — |
| `backend/docker-compose.yml` | main-service, main-db, valkey | Both root files |
| `backend/docker-compose.dev.yml` | Backend hot-reload override | Root dev only |
| `website/docker-compose.yml` | next-js (prod, `profiles: [prod]`) | Root prod only |

The dev root file deliberately does **not** include
`website/docker-compose.yml` — dev Next.js is defined inline at the
root because it's a different beast (`next dev` in a plain `node:22`
image) from the standalone build in the website file. Splitting them
keeps each file honest about what it ships.

The `next-js` service in `website/docker-compose.yml` sits behind
`profiles: [prod]`, so even running the root prod file without
`--profile prod` starts Traefik + backend but skips the frontend —
which matches how CI invokes it.

The two root stacks use different `name:` namespaces
(`unidoka-com` vs `unidoka-com-dev`), so dev and prod can coexist on
the same machine without clashing on containers, networks, or DB
volumes.

## Image optimization

Next.js's image optimizer (`next/image`) runs **in-process inside the
`next-js` container**. When the browser requests
`/_next/image?url=/order_files/…`, the optimizer reads the source file
from the container's own filesystem, resizes it, and serves the result.

For this to work, every uploaded file must be readable **inside the
`next-js` container** at the path the browser requests. The backend
writes uploads to `backend/services/main-service/storage/order_files`,
so both dev and prod mount that directory into the frontend's
`public/` folder:

```yaml
volumes:
  - ../backend/services/main-service/storage/order_files:/app/public/order_files
```

Without this mount, `/order_files/*` 404s inside the container,
`next/image` falls back to the raw `<img>` src, and optimization is
silently skipped. Both stacks include the mount, so avatars and event
covers resolve identically in dev and prod.

The route handler at `app/order_files/[...path]/route.ts` is a dev-time
fallback: if the volume mount is missing, it looks for the file in a
few candidate directories relative to the container's working
directory. On prod the mount is the primary path — the route handler
is never hit.

## Slim build contexts

Both Dockerfiles are paired with a `.dockerignore` that removes
everything the build doesn't need: VCS metadata, caches, env files,
test suites, and — critically — the runtime upload directory
(`storage/`, `public/order_files/`). Trimming the context makes the
build faster on CI runners and prevents accidentally baking uploads
or secrets into an image layer.

| File | Context it scopes |
|---|---|
| `backend/services/main-service/.dockerignore` | The FastAPI image |
| `website/.dockerignore` | The Next.js image |

## Env files

| File | Scope | Purpose |
|---|---|---|
| `.env.example` → `.env` | root | Shared by Compose (DB, JWT, SMTP, Telegram, `NEXT_PUBLIC_*`) |
| `website/.env.example` → `website/.env` | frontend | Same `NEXT_PUBLIC_*` vars if running `next dev` outside Docker |

**Build-time vs runtime.** `NEXT_PUBLIC_*` vars are inlined into the
Next.js bundle at **build** time. Setting them at runtime has no
effect. In prod the CI workflow passes them as `--build-arg`, so they
come from GitHub **Variables**, not from the VPS `.env`. In dev,
`docker-compose.dev.yml` overrides `NEXT_PUBLIC_API_BASE_URL=""` so the
rewrite proxy in `next.config.ts` takes over — an absolute base URL
would make `$fetch` call the browser's `localhost` and bypass the
Docker network.

## CI / Deploy

`.github/workflows/deploy.yml` builds each service image on the GitHub
runner and ships the tarball to the VPS. The VPS never builds — it
`docker load`s the image and reconciles with
`docker compose --profile prod up -d`.

Push to `main` → only the services whose source changed are rebuilt.
Changed root files (`.env*`, `docker-compose*`, `seed_events.sql`, the
workflow itself) trigger a full rebuild. Manual `workflow_dispatch`
with `force_rebuild: true` rebuilds everything.

## License

Apache 2.0 — see [LICENSE](./LICENSE).
