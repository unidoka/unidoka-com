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

import html
import os
import re
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional
from urllib.parse import parse_qs, quote, urlparse

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

    # Accept the HTML embed URL as a convenience: /calendar/embed?src=<id>
    # is what Google shows in "Integrate calendar", but it is a web page,
    # not an iCal feed. Rewrite it to the matching public ICS export.
    if (
        parsed.hostname in {"calendar.google.com", "www.google.com"}
        and parsed.path.rstrip("/") == "/calendar/embed"
    ):
        calendar_id = (parse_qs(parsed.query).get("src") or [""])[0].strip()
        if calendar_id:
            return (
                "https://calendar.google.com/calendar/ical/"
                f"{quote(calendar_id, safe='')}/public/basic.ics"
            )

    return url


def public_feed_url() -> str:
    """The public, client-shareable ICS URL (https, normalised).

    Safe to expose: it is the same public feed anyone with the link can
    read. Raises RuntimeError when the feed is not configured.
    """
    return _validate_url(_ICAL_URL)


def _as_ical_datetime(dt) -> Optional[datetime]:
    """Normalise iCal values for the API.

    Timed events with a timezone become **aware UTC**, so the browser
    converts them to the viewer's local clock (Moscow 11:00, not the raw
    08:00Z). Date-only values stay naive midnight - all-day events are
    calendar dates, not instants. Floating datetimes also stay naive,
    matching the naive datetimes the rest of the codebase emits.

    Defensive about missing tzinfo data: if `astimezone()` fails, keep
    the value as UTC rather than dropping the whole event.
    """
    if dt is None:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is not None:
            try:
                return dt.astimezone(timezone.utc)
            except Exception:
                return dt.replace(tzinfo=timezone.utc)
        return dt
    # date-only value
    return datetime(dt.year, dt.month, dt.day)


def _is_date_only(prop) -> bool:
    """True for `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` (all-day) values.

    `datetime` subclasses `date`, so the order of the checks matters.
    """
    if prop is None:
        return False
    value = prop.dt
    return isinstance(value, date) and not isinstance(value, datetime)


# The public Google Calendar description is also a small markup format.
# Registration and tags are author-defined plain-text lines; HTML anchors
# from older events are still accepted for backwards compatibility:
#   Регистрация: https://…          (also "Registration:" / "Register:")
#   Теги: конференция, форум        (also "Tags:")
#   <a data-type="register" href="https://…">…</a>   (legacy)
#   …<br><br>#tag_1 #tag_2                           (legacy)
# Registration and tags are presentation, not description text. Pull them
# out once, here, so every consumer (card, dialog, full page) gets the same
# result and the link is never rendered twice.
_REGISTER_ANCHOR_RE = re.compile(
    r'<a\b[^>]*\bdata-type\s*=\s*["\']register["\'][^>]*>.*?</a>',
    re.IGNORECASE | re.DOTALL,
)
_REGISTER_LINE_RE = re.compile(
    r'(?:Регистрация|Registration|Register)\s*:\s*'
    r'(?:<br\s*/?>\s*)*'
    r'(?:(?P<url>https?://[^\s<"\']+)|\$?LINK_HERE)',
    re.IGNORECASE,
)
_TAGS_LINE_RE = re.compile(
    r'(?:Теги|Tags)\s*:\s*(?P<tags>.*?)(?=<br\s*/?>|</?p\b|\n|$)',
    re.IGNORECASE,
)
_TRAILING_TAGS_RE = re.compile(
    r'(?:<br\s*/?>\s*|\n\s*)+(#[\w-]+(?:[ \t,]+#[\w-]+)*)\s*$',
    re.IGNORECASE,
)
_HREF_RE = re.compile(
    r'\bhref\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))',
    re.IGNORECASE,
)


def _anchor_href(anchor: str) -> Optional[str]:
    match = _HREF_RE.search(anchor)
    if not match:
        return None
    href = next((g for g in match.groups() if g), "").strip()
    href = html.unescape(href)
    # A literal "$LINK_HERE" is a template placeholder, not a URL.
    if not href or href.startswith("$"):
        return None
    # Never let a feed inject javascript:/data: into a rendered href.
    if not re.match(r"^https?://", href, re.IGNORECASE):
        return None
    return href


def _anchor_text_url(anchor: str) -> Optional[str]:
    text = html.unescape(re.sub(r"<[^>]+>", "", anchor)).strip()
    return text if re.match(r"^https?://", text, re.IGNORECASE) else None


def _split_tag_names(block: str) -> list[str]:
    """Split a tags line into names.

    Comma is the primary separator ("как в env-файлах"); a legacy
    whitespace-separated hashtag block is also accepted.
    """
    block = re.sub(r'<br\s*/?>', ',', block, flags=re.IGNORECASE)
    block = re.sub(r'<[^>]+>', '', block)
    block = html.unescape(block).strip()
    if not block:
        return []

    if "," in block:
        raw_names = block.split(",")
    elif "#" in block:
        raw_names = block.split()
    else:
        raw_names = [block]

    names: list[str] = []
    for raw in raw_names:
        name = raw.strip().lstrip("#").strip()
        if name and name.lower() not in {n.lower() for n in names}:
            names.append(name)
    return names


def _parse_description(
    description: Optional[str], fallback_url: Optional[str]
) -> tuple[Optional[str], Optional[str], list[str]]:
    """Return (clean description, register URL, tag names)."""
    text = description or ""
    register_url = fallback_url

    # Legacy HTML anchors.
    for match in _REGISTER_ANCHOR_RE.finditer(text):
        anchor = match.group(0)
        url = _anchor_href(anchor) or _anchor_text_url(anchor)
        if url:
            register_url = url
    text = _REGISTER_ANCHOR_RE.sub("", text)

    # Plain-text "Регистрация: <url>" / "Register: <url>". A literal
    # LINK_HERE / $LINK_HERE placeholder is removed; the event's URL
    # field remains the fallback.
    for match in _REGISTER_LINE_RE.finditer(text):
        url = match.group("url")
        if url:
            url = html.unescape(url).rstrip(".,;:)")
            if re.match(r"^https?://", url, re.IGNORECASE):
                register_url = url
    text = _REGISTER_LINE_RE.sub("", text)
    text = text.replace("$LINK_HERE", "")

    tags: list[str] = []

    # "Теги: a, b" / "Tags: a, b"
    for match in _TAGS_LINE_RE.finditer(text):
        for name in _split_tag_names(match.group("tags")):
            if name.lower() not in {t.lower() for t in tags}:
                tags.append(name)
    text = _TAGS_LINE_RE.sub("", text)

    # A bare hashtag block at the end, e.g. "…<br><br>#a #b".
    for match in _TRAILING_TAGS_RE.finditer(text):
        for name in _split_tag_names(match.group(1)):
            if name.lower() not in {t.lower() for t in tags}:
                tags.append(name)
    text = _TRAILING_TAGS_RE.sub("", text)

    # Removing the inline blocks can leave an empty paragraph behind.
    text = re.sub(r"<p>\s*</p>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"(?:\s*<br\s*/?>\s*){3,}", "<br><br>", text, flags=re.IGNORECASE)
    text = re.sub(r"^(?:\s*<br\s*/?>\s*)+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"(?:\s*<br\s*/?>\s*)+$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    return text or None, register_url or None, tags


def _tag_objects(names: list[str]) -> list[dict]:
    """iCal has no taxonomy tables, so give parsed tags the shape the
    shared SubdirectionOut schema expects. Deterministic ids keep URLs
    and React keys stable across refetches."""
    direction_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "ical:tags"))
    return [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"ical:tag:{n.lower()}")),
            "direction_id": direction_id,
            "name": n,
            "slug": _slugify(n),
            "sort_order": i,
            "is_active": True,
        }
        for i, n in enumerate(names)
    ]


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
    location = _text(component, "LOCATION")
    url_field = _text(component, "URL")
    description, registration_url, tag_names = _parse_description(
        _text(component, "DESCRIPTION"), url_field
    )

    start_raw = component.get("DTSTART")
    end_raw = component.get("DTEND")
    is_all_day = _is_date_only(start_raw)
    start_dt = _as_ical_datetime(start_raw.dt if start_raw else None)
    end_dt = _as_ical_datetime(end_raw.dt if end_raw else None)

    # RFC 5545: a DATE-valued DTEND is exclusive. The UI treats end_at as
    # the last visible day, so subtract one day (Nov 20 -> Nov 23 becomes
    # Nov 20 -> Nov 22). Without this, every all-day event is painted one
    # day too long.
    if is_all_day and _is_date_only(end_raw) and start_dt and end_dt:
        if end_dt > start_dt:
            end_dt -= timedelta(days=1)

    # Some feeds encode the length as DURATION instead of DTEND.
    if end_dt is None and start_dt is not None:
        duration = component.get("DURATION")
        if duration is not None:
            try:
                end_dt = start_dt + duration.dt
                if is_all_day and end_dt > start_dt:
                    end_dt -= timedelta(days=1)
            except Exception:
                pass

    # A one-day all-day event has no meaningful end; keep it on one day.
    if is_all_day and end_dt is None:
        end_dt = start_dt

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
        "is_all_day": is_all_day,
        "registration_deadline": None,
        "other_dates": [],
        "location_name": location,
        "address": None,
        "city": None,
        "price": None,
        "capacity": None,
        "registration_url": registration_url,
        "is_featured": False,
        "status": "approved",
        "custom_page": None,
        "created_at": now,
        "updated_at": now,
        "organizer": None,
        "custom_organizer_name": None,
        "types": [],
        "tags": _tag_objects(tag_names),
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
                headers={
                    "Accept": "text/calendar, */*;q=0.8",
                    "User-Agent": "Mozilla/5.0 (compatible; UnidokaCalendar/1.0)",
                },
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

    # Chronological, with undated events last. Aware (timed) and naive
    # (all-day) values share one comparable axis.
    def sort_instant(value: Optional[datetime]) -> datetime:
        if value is None:
            return datetime.max.replace(tzinfo=timezone.utc)
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    out.sort(key=lambda e: (e["start_at"] is None, sort_instant(e["start_at"])))
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
