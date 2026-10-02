import os
import re
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")


def _build_cors_config(raw: str) -> tuple[list[str], str | None]:
    """
    Split a comma-separated origin list into literals + one regex.

    Entries without `*` go straight into `allow_origins`. Entries with
    `*` are converted into regex fragments and OR-joined into
    `allow_origin_regex`. Both are passed to CORSMiddleware, which
    accepts an origin matching either.

    Examples:
        http://localhost:3000          → literal
        http://*.localhost             → regex: ^http://[^.]+\.localhost$
        https://*.unidoka.com          → regex: ^https://[^.]+\.unidoka\.com$
        https://*.*.unidoka.com        → regex: ^https://[^.]+(\.[^.]+)*\.unidoka\.com$
    """
    literal: list[str] = []
    patterns: list[str] = []

    for entry in (raw or "").split(","):
        entry = entry.strip()
        if not entry:
            continue
        if "*" not in entry:
            literal.append(entry)
            continue
        # Escape everything, then un-escape the `*` and swap it for a
        # host-label matcher `[^.]+`. This handles `*.foo.com` cleanly
        # and doesn't let `*` swallow dots, which is the usual footgun.
        escaped = re.escape(entry)
        # re.escape turns `*` into `\*`, undo that.
        pattern = escaped.replace(r"\*", r"[^.]+")
        patterns.append(f"^{pattern}$")

    regex = "|".join(patterns) if patterns else None
    return literal, regex


_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
_literal, _regex = _build_cors_config(_raw_origins)

logger.info(f"CORS literal origins: {_literal}")
logger.info(f"CORS origin regex: {_regex}")

app = FastAPI(title="Main Service", version="1.0.0", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_literal,
    allow_origin_regex=_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.middleware("http")(global_rate_limit)
app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main-service"}
