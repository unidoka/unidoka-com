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


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main-service"}
