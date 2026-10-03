import os
import re
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")

# Loud startup check for notification-related env vars. Missing values
# here are silent at request time (delivery just returns False), so log
# them once at boot instead of forcing the operator to infer it from a
# missing email.
_notif_required = ["MAIL_SENDER", "MAIL_PASSWORD", "MAIL_SERVER"]
_notif_missing = [k for k in _notif_required if not os.getenv(k)]
if _notif_missing:
    logger.warning(
        "Email notifications DISABLED — missing env vars: %s",
        ", ".join(_notif_missing),
    )
if not os.getenv("TELEGRAM_BOT_TOKEN"):
    logger.warning("Telegram notifications DISABLED — TELEGRAM_BOT_TOKEN not set")

app = FastAPI(title="Main Service", version="1.0.0", root_path="/api")

# LLM context: ALLOWED_ORIGINS accepts exact origins AND wildcards like
# "https://*.unidoka.com". Wildcard entries collapse into a single
# allow_origin_regex so any subdomain (app.*, admin.*, i.*) passes CORS.
# Without this, authenticated XHRs from subdomains are rejected by the
# browser's preflight even though the auth cookie is present.
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
entries = [o.strip() for o in raw_origins.split(",") if o.strip()]
exact_origins: list[str] = []
wildcard_patterns: list[str] = []
for entry in entries:
    if "*" in entry:
        # re.escape then un-escape the wildcard character.
        pattern = re.escape(entry).replace(r"\*", ".*")
        wildcard_patterns.append(pattern)
    else:
        exact_origins.append(entry)

allow_origin_regex = (
    "|".join(f"^{p}$" for p in wildcard_patterns) if wildcard_patterns else None
)

logger.info(
    "CORS: exact=%s wildcard_regex=%s",
    exact_origins,
    allow_origin_regex,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=exact_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(global_rate_limit)
app.include_router(router)


# Serve uploaded images (avatars, attachments). Mirrors the
# bind mount the frontend uses in prod, and gives the Next.js
# dev proxy a real origin to rewrite /order_files/* to.
_storage_root = Path("/app/storage/order_files")
if _storage_root.exists():
    app.mount("/order_files", StaticFiles(directory=str(_storage_root)), name="order_files")


# Serve uploaded images (avatars, attachments). The directory must exist
# at boot or StaticFiles throws and silently skips the mount — create it
# first so /order_files/* is always available.
_storage_root = Path("/app/storage/order_files")
_storage_root.mkdir(parents=True, exist_ok=True)
app.mount("/order_files", StaticFiles(directory=str(_storage_root)), name="order_files")




# ── Startup: seed the events taxonomy if empty ─────────────────────
# The events editor needs types + directions to render its pill
# pickers. On a fresh DB those tables are empty, so the form shows
# "Типы не загружены". This seeds a sensible default set once, on
# boot, so a fresh deploy is immediately usable. Idempotent: skipped
# if any row already exists in event_types.
def _seed_taxonomy_if_empty() -> None:
    try:
        from database.database import SessionLocal
        from app.models.event import (
            Organizer, EventType, EventDirection, EventSubdirection,
        )
        import re

        def slugify(t: str) -> str:
            t = t.lower().strip()
            t = re.sub(r"[^\w\s-]", "", t, flags=re.UNICODE)
            t = re.sub(r"[\s_]+", "-", t)
            return re.sub(r"-+", "-", t).strip("-")

        db = SessionLocal()
        try:
            if db.query(EventType).count() == 0:
                TYPES = [
                    ("IT", "cpu", "#3b82f6"),
                    ("Бизнес", "briefcase", "#f59e0b"),
                    ("Дизайн", "palette", "#ec4899"),
                    ("Досуг", "coffee", "#10b981"),
                    ("Искусство", "paint-brush", "#a855f7"),
                    ("Наука", "flask", "#06b6d4"),
                    ("Медиа", "megaphone", "#ef4444"),
                    ("Спорт", "barbell", "#84cc16"),
                ]
                for i, (name, icon, color) in enumerate(TYPES):
                    db.add(EventType(
                        name=name, slug=slugify(name),
                        icon=icon, color=color, sort_order=i,
                    ))
                db.commit()
                logger.info("Seeded %d event types", len(TYPES))

            if db.query(EventDirection).count() == 0:
                DIRECTIONS = [
                    ("Software-разработка", "💻", [
                        "Веб-разработка", "DevOps", "ML",
                        "Flutter: desktop и мобильная разработка",
                        "Инфобез", "1С", "UX/UI-дизайн",
                    ]),
                    ("Дизайн", "✍", [
                        "3D", "Видеопроизводство", "Графический дизайн",
                    ]),
                    ("Бизнес", "💼", [
                        "Бизнес-аналитика и экономика", "SMM",
                        "Публичные выступления",
                    ]),
                    ("Hardware-разработка", "🤖", [
                        "Разработка микроконтроллеров", "Дроны", "3D-печать",
                    ]),
                ]
                for di, (dname, emoji, subs) in enumerate(DIRECTIONS):
                    d = EventDirection(
                        name=dname, slug=slugify(dname),
                        emoji=emoji, sort_order=di,
                    )
                    db.add(d)
                    db.flush()
                    for si, sname in enumerate(subs):
                        db.add(EventSubdirection(
                            direction_id=d.id, name=sname,
                            slug=slugify(sname), sort_order=si,
                        ))
                db.commit()
                logger.info("Seeded %d directions with subdirections", len(DIRECTIONS))

            if db.query(Organizer).count() == 0:
                ORGANIZERS = [
                    ("Росмолодёжь", "#336DFF"),
                    ("Росконгресс", "#E8590C"),
                    ("Юнидока", "#0CA678"),
                ]
                for name, color in ORGANIZERS:
                    db.add(Organizer(name=name, slug=slugify(name), color=color))
                db.commit()
                logger.info("Seeded %d organizers", len(ORGANIZERS))
        finally:
            db.close()
    except Exception as e:
        logger.warning("Taxonomy seed skipped: %s", e)


@app.on_event("startup")
def _on_startup() -> None:
    _seed_taxonomy_if_empty()


@app.get("/health")

async def health():
    return {"status": "healthy", "service": "main-service"}
