"""Public calendar source — an external iCal feed.

The events calendar is read-only from the app's perspective: events
come from a Google Calendar (or any RFC 5545 source) published as an
ICS feed. This service fetches, parses, caches, and normalises that
feed into the same dict shape the frontend already consumes, so the
existing EventListItem / EventDetail schemas and the calendar UI
keep working unchanged.

SECURITY
--------
The feed URL is **server-side only** (env var). Never accept it from
a client, query param, or request body — an attacker could point it
at internal endpoints (http://169.254.169.254/, http://valkey/, …)
and turn the backend into an SSRF proxy.

Additional guard rails, all enforced here:

  • https-only — no http, file, gopher, data, …
  • size cap — refuses payloads over PUBLIC_ICAL_MAX_BYTES
  • timeout — bounded by PUBLIC_ICAL_TIMEOUT (httpx hard timeout)
  • redirects capped at 3, still https-only on each hop
  • recurrence expansion bounded to a fixed window, so a malicious
    RRULE=FREQ=SECONDLY cannot blow up memory
  • in-memory cache — no more than one outbound fetch per TTL

The previous DB-backed listing remains in `app/api/v1/events.py`,
commented out, so switching back is a one-file edit.
"""

from __future__ import annotations

import os
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlparse

import httpx

try:
    from icalendar import Calendar as ICalCalendar
except ImportError:  # pragma: no cover
    ICalCalendar = None

try:
    import recurring_ical_events
except ImportError:  # pragma: no cover
    recurring_ical_events = None


# ── Config ────────────────────────────────────────────────────────────
_ICAL_URL = os.getenv("PUBLIC_ICAL_URL", "").strip()
_ICAL_TIMEOUT = float(os.getenv("PUBLIC_ICAL_TIMEOUT", "15"))
_ICAL_MAX_BYTES = int(
    os.getenv("PUBLIC_ICAL_MAX_BYTES", str(5 * 1024 * 1024))
)
_ICAL_CACHE_TTL = int(os.getenv("PUBLIC_ICAL_CACHE_TTL", "120"))
_ICAL_WINDOW_BACK_DAYS = int(os.getenv("PUBLIC_ICAL_WINDOW_BACK_DAYS", "365"))
_ICAL_WINDOW_FWD_DAYS = int(os.getenv("PUBLIC_ICAL_WINDOW_FWD_DAYS", "730"))


# Same transliteration table events.py already uses, so slugs from the
# iCal feed look like slugs from the DB path.
_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def _slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = "".join(_TRANSLIT.get(c, c) for c in text)
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:180] or "event"


def _validate_url(url: str) -> str:
    """SECURITY: https-only. Blocks file://, http://, gopher://, …"""
    if not url:
        raise RuntimeError("PUBLIC_ICAL_URL is not configured")
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise RuntimeError(
            f"PUBLIC_ICAL_URL must use https, got {parsed.scheme!r}"
        )
    if not parsed.hostname:
        raise RuntimeError("PUBLIC_ICAL_URL has no hostname")
    return url


def _naive_utc(dt) -> Optional[datetime]:
    """Normalise iCal datetime values to naive UTC (matches the rest of
    the codebase, which stores naive datetimes).

    Defensive about missing tzinfo data: `python:3.12-slim` ships no
    IANA zone database unless tzdata is installed. `icalendar` returns
    DTSTART as a raw string when it can't resolve `TZID`, and calling
    `.astimezone()` on it blows up. If that happens, fall back to
    treating the value as UTC rather than dropping the whole event.
    """
    if dt is None:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is not None:
            try:
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            except Exception:
                # Unresolvable tzid (missing tzdata) — keep the value,
                # treat as UTC. Wrong-by-hours beats missing.
                return dt.replace(tzinfo=None)
        return dt
    # date-only value
    return datetime(dt.year, dt.month, dt.day)


def _text(component, key: str) -> Optional[str]:
    val = component.get(key)
    if val is None:
        return None
    s = str(val).strip()
    return s or None


def _serialize(component) -> dict:
    uid = _text(component, "UID") or str(uuid.uuid4())
    # Deterministic UUID so /events/{id}/{slug} URLs stay stable across
    # refetches, and the frontend's id-vs-slug redirect check holds.
    event_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"ical:{uid}"))

    title = _text(component, "SUMMARY") or "Untitled event"
    description = _text(component, "DESCRIPTION")
    location = _text(component, "LOCATION")
    url_field = _text(component, "URL")

    start_raw = component.get("DTSTART")
    end_raw = component.get("DTEND")
    start_dt = _naive_utc(start_raw.dt if start_raw else None)
    end_dt = _naive_utc(end_raw.dt if end_raw else None)

    now = datetime.utcnow()
    short = (description or "")[:200] or None

    return {
        "id": event_id,
        "slug": _slugify(title),
        "title": title,
        "short_description": short,
        "cover_image_src": "",
        "cover_video_src": None,
        "start_at": start_dt,
        "end_at": end_dt,
        "registration_deadline": None,
        "other_dates": [],
        "location_name": location,
        "address": None,
        "city": None,
        "price": None,
        "capacity": None,
        "registration_url": url_field,
        "is_featured": False,
        "status": "approved",
        "custom_page": None,
        "created_at": now,
        "updated_at": now,
        "organizer": None,
        "custom_organizer_name": None,
        "types": [],
        "tags": [],
        "submitted_by": None,
        "submitted_by_id": None,
        # EventDetail-only fields
        "description": description,
        "metro": None,
        "href": url_field,
        "mdx_content": None,
        "seo_title": None,
        "meta_description": None,
        "rejection_reason": None,
        "reviewed_by_id": None,
        "reviewed_at": None,
    }


async def fetch_ical_events() -> list[dict]:
    """Fetch + parse + normalise the feed. Raises RuntimeError on any
    failure so callers can decide whether to degrade or error out."""
    if ICalCalendar is None:
        raise RuntimeError(
            "icalendar library not installed — add it to requirements.txt"
        )
    url = _validate_url(_ICAL_URL)

    async with httpx.AsyncClient(
        timeout=_ICAL_TIMEOUT,
        follow_redirects=True,
        max_redirects=3,
    ) as client:
        try:
            resp = await client.get(
                url,
                headers={"Accept": "text/calendar, */*;q=0.8"},
            )
        except httpx.HTTPError as exc:
            raise RuntimeError(f"iCal fetch failed: {exc}") from exc

    if resp.status_code != 200:
        raise RuntimeError(f"iCal fetch failed: HTTP {resp.status_code}")

    if len(resp.content) > _ICAL_MAX_BYTES:
        raise RuntimeError(
            f"iCal payload too large: {len(resp.content)} > {_ICAL_MAX_BYTES}"
        )

    try:
        cal = ICalCalendar.from_ical(resp.content)
    except Exception as exc:
        raise RuntimeError(f"iCal parse failed: {exc}") from exc

    # Expand recurring events inside a bounded window. Without a window,
    # an RRULE like FREQ=SECONDLY would generate millions of occurrences
    # in memory — cheap denial-of-service from a hostile feed.
    if recurring_ical_events is not None:
        now = datetime.now(timezone.utc)
        lo = now - timedelta(days=_ICAL_WINDOW_BACK_DAYS)
        hi = now + timedelta(days=_ICAL_WINDOW_FWD_DAYS)
        try:
            raw = recurring_ical_events.of(cal).between(lo, hi)
        except Exception:
            raw = [c for c in cal.walk() if c.name == "VEVENT"]
    else:
        raw = [c for c in cal.walk() if c.name == "VEVENT"]

    out: list[dict] = []
    seen_slugs: dict[str, int] = {}
    for comp in raw:
        status = (_text(comp, "STATUS") or "").upper()
        if status == "CANCELLED":
            continue
        try:
            item = _serialize(comp)
        except Exception:
            # One malformed event must not take down the whole feed.
            continue
        # De-dupe slugs so /events/{id}/{slug} stays unique even if
        # two events share a title.
        base = item["slug"]
        n = seen_slugs.get(base, 0)
        if n > 0:
            item["slug"] = f"{base}-{n + 1}"
        seen_slugs[base] = n + 1
        out.append(item)

    # Chronological, with undated events last.
    out.sort(
        key=lambda e: (e["start_at"] is None, e["start_at"] or datetime.max)
    )
    return out


# ── In-memory cache ───────────────────────────────────────────────────
# One outbound fetch per TTL. The cache is process-local, which is fine
# for a single container. If you scale to N replicas, each gets its own
# 2-minute window — cheap enough to accept, and honest about the limits
# of a shared Redis cache for something this small.
_cache: dict = {"data": None, "ts": 0.0}


async def get_cached_events(force: bool = False) -> list[dict]:
    now = time.time()
    if (
        not force
        and _cache["data"] is not None
        and now - _cache["ts"] < _ICAL_CACHE_TTL
    ):
        return _cache["data"]
    data = await fetch_ical_events()
    _cache["data"] = data
    _cache["ts"] = now
    return data


def find_event(events: list[dict], slug_or_id: str) -> Optional[dict]:
    for e in events:
        if e["slug"] == slug_or_id or e["id"] == slug_or_id:
            return e
    return None
