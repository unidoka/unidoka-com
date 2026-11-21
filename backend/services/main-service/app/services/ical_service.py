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

There are four configured feeds: activities and competitions, each in
Russian and English (`PUBLIC_ICAL_URL_ACTIVITIES`,
`PUBLIC_ICAL_URL_ACTIVITIES_EN`, `PUBLIC_ICAL_URL_COMPETITIONS`,
`PUBLIC_ICAL_URL_COMPETITIONS_EN`). A missing locale-specific var falls
back to its English variant. The cache and all parsing are per feed.

Additional guard rails, all enforced here:

  • https-only — no http, file, gopher, data, …
  • size cap — refuses payloads over PUBLIC_ICAL_MAX_BYTES
  • timeout — bounded by PUBLIC_ICAL_TIMEOUT (httpx hard timeout)
  • redirects capped at 3, still https-only on each hop
  • recurrence expansion bounded to a fixed window, so a malicious
    RRULE=FREQ=SECONDLY cannot blow up memory
  • in-memory cache — one outbound fetch per TTL per locale

The previous DB-backed listing remains in `app/api/v1/events.py`,
commented out, so switching back is a one-file edit.
"""

from __future__ import annotations

import html
import logging
import os
import asyncio
import re
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
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
# Every category has its own feed per language. Missing locale vars fall
# back to the English variant.
_CATEGORY_ENV: dict[str, tuple[str, str]] = {
    "activities": (
        "PUBLIC_ICAL_URL_ACTIVITIES",
        "PUBLIC_ICAL_URL_ACTIVITIES_EN",
    ),
    "competitions": (
        "PUBLIC_ICAL_URL_COMPETITIONS",
        "PUBLIC_ICAL_URL_COMPETITIONS_EN",
    ),
}
_CATEGORY_URLS: dict[str, tuple[str, str]] = {
    category: (os.getenv(ru_var, "").strip(), os.getenv(en_var, "").strip())
    for category, (ru_var, en_var) in _CATEGORY_ENV.items()
}

logger = logging.getLogger(__name__)

for _category, (_ru_var, _en_var) in _CATEGORY_ENV.items():
    _ru_url, _en_url = _CATEGORY_URLS[_category]
    if not _ru_url and not _en_url:
        logger.warning(
            "iCal feed is not configured for %s (set %s and/or %s)",
            _category,
            _ru_var,
            _en_var,
        )

_ICAL_TIMEOUT = float(os.getenv("PUBLIC_ICAL_TIMEOUT", "15"))
_ICAL_MAX_BYTES = int(
    os.getenv("PUBLIC_ICAL_MAX_BYTES", str(5 * 1024 * 1024))
)
_ICAL_CACHE_TTL = int(os.getenv("PUBLIC_ICAL_CACHE_TTL", "900"))
_ICAL_WINDOW_BACK_DAYS = int(os.getenv("PUBLIC_ICAL_WINDOW_BACK_DAYS", "365"))
_ICAL_WINDOW_FWD_DAYS = int(os.getenv("PUBLIC_ICAL_WINDOW_FWD_DAYS", "730"))

CATEGORIES = ("activities", "competitions")


def normalize_locale(locale: Optional[str]) -> str:
    """Map arbitrary client input to one of the supported feed locales."""
    return "en" if (locale or "").lower().startswith("en") else "ru"


def normalize_category(category: Optional[str]) -> str:
    value = (category or "").strip().lower()
    return value if value in CATEGORIES else "activities"


def _feed_url(
    locale: Optional[str] = None, category: Optional[str] = None
) -> str:
    """Resolve the configured feed for locale + category.

    Fallback: the locale's own category var, then the English variant.
    """
    cat = normalize_category(category)
    ru_url, en_url = _CATEGORY_URLS.get(cat, ("", ""))

    if normalize_locale(locale) == "en":
        url = en_url or ru_url
    else:
        url = ru_url or en_url

    if not url:
        raise RuntimeError(
            f"iCal feed is not configured for category {cat!r}"
        )
    return url



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
        raise RuntimeError("iCal feed is not configured")
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise RuntimeError(
            f"iCal feed must use https, got {parsed.scheme!r}"
        )
    if not parsed.hostname:
        raise RuntimeError("iCal feed has no hostname")

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


def public_feed_url(
    locale: Optional[str] = None, category: Optional[str] = None
) -> str:
    """The public, client-shareable ICS URL (https, normalised).

    Safe to expose: it is the same public feed anyone with the link can
    read. Raises RuntimeError when the feed is not configured.
    """
    return _validate_url(_feed_url(locale, category))


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
    r'(?:(?P<url>https?://[^\s<"\']+)'
    r'|(?P<anchor><a\b[^>]*>[^<]*</a>)'
    r'|\$?LINK_HERE)',
    re.IGNORECASE,
)
_TAGS_LINE_RE = re.compile(
    r'(?:Теги|Tags)\s*:\s*(?:<br\s*/?>\s*)*'
    r'(?P<tags>.*?)(?=<br\s*/?>|</?p\b|\n|$)',
    re.IGNORECASE,
)
_DEADLINE_LINE_RE = re.compile(
    r'\(?\s*(?:Дедлайн(?:\s+регистрации)?|Регистрация\s+до'
    r'|Registration\s+deadline|Register\s+by|Registration\s+closes)'
    r'\s*\)?\s*[:\-—–]?\s*(?:<br\s*/?>\s*)*'
    r'(?P<text>[^<)\n]+?)\s*\)?'
    r'(?=<br\s*/?>|</?p\b|\n|$)',
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


# iCal descriptions are HTML written by whoever owns the calendar. The
# site injects them with dangerouslySetInnerHTML, so anything the feed
# author puts there runs in every visitor's browser — including the
# admin's, whose JWT sits in a JS-readable cookie. Keep only formatting
# tags and http(s) links; drop scripts, event handlers, styles, images.
_DESCRIPTION_ALLOWED_TAGS = frozenset({
    "a", "br", "p", "b", "strong", "i", "em", "ul", "ol", "li",
})
_DESCRIPTION_VOID_TAGS = frozenset({"br"})


class _DescriptionSanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.open_tags: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in ("script", "style"):
            self._skip_depth += 1
            return
        if self._skip_depth or tag not in _DESCRIPTION_ALLOWED_TAGS:
            return
        if tag == "a":
            href = next(
                (v for k, v in attrs if k.lower() == "href"), None
            )
            if not href or not re.match(r"^https?://", href.strip(), re.I):
                return
            self.parts.append(
                '<a href="'
                + html.escape(href.strip(), quote=True)
                + '" rel="noopener noreferrer" target="_blank">'
            )
        elif tag in _DESCRIPTION_VOID_TAGS:
            self.parts.append(f"<{tag} />")
            return
        else:
            self.parts.append(f"<{tag}>")
        self.open_tags.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ("script", "style"):
            self._skip_depth = max(0, self._skip_depth - 1)
            return
        if self._skip_depth or tag not in _DESCRIPTION_ALLOWED_TAGS:
            return
        if tag in _DESCRIPTION_VOID_TAGS or tag not in self.open_tags:
            return
        while self.open_tags:
            open_tag = self.open_tags.pop()
            self.parts.append(f"</{open_tag}>")
            if open_tag == tag:
                break

    def handle_data(self, data):
        if self._skip_depth:
            return
        self.parts.append(html.escape(data).replace("{", "&#123;").replace("}", "&#125;"))

    def result(self) -> str:
        return "".join(self.parts)


def _sanitize_description(text: str) -> str:
    parser = _DescriptionSanitizer()
    try:
        parser.feed(text)
        parser.close()
    except Exception:
        # A malformed feed should degrade to escaped text, not 500 the
        # whole calendar.
        return html.escape(re.sub(r"<[^>]+>", " ", text))
    return parser.result()


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
) -> tuple[Optional[str], Optional[str], list[str], Optional[str]]:
    """Return (clean description, register URL, tag names, deadline text)."""
    text = description or ""
    register_url = fallback_url
    if register_url and not re.match(r"^https?://", register_url, re.IGNORECASE):
        register_url = None

    # Legacy HTML anchors.
    for match in _REGISTER_ANCHOR_RE.finditer(text):
        anchor = match.group(0)
        url = _anchor_href(anchor) or _anchor_text_url(anchor)
        if url:
            register_url = url
    text = _REGISTER_ANCHOR_RE.sub("", text)

    # "Дедлайн регистрации: 1 декабря" / "Registration deadline: Dec 1".
    # Shown as a separate badge in the UI, never rendered in the body.
    deadline_text: Optional[str] = None
    for match in _DEADLINE_LINE_RE.finditer(text):
        value = match.group("text").strip(" .;,–—-")
        if value:
            deadline_text = value
    text = _DEADLINE_LINE_RE.sub("", text)

    # Plain-text "Регистрация: <url>" / "Register: <url>". A literal
    # LINK_HERE / $LINK_HERE placeholder is removed; the event's URL
    # field remains the fallback.
    for match in _REGISTER_LINE_RE.finditer(text):
        url = match.group("url")
        if not url and match.group("anchor"):
            anchor = match.group("anchor")
            url = _anchor_href(anchor) or _anchor_text_url(anchor)
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

    # iCal DESCRIPTION is plain text with real newlines. The site renders
    # it as HTML (dialog) and MDX (event page), where a bare newline is
    # collapsed to a space. Turn line breaks into <br /> so paragraphs
    # survive both renderers.
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\n\n", "<br /><br />").replace("\n", "<br />")

    text = _sanitize_description(text)

    return text or None, register_url or None, tags, deadline_text


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


_CITY_NAMES = {
    "казань", "москва", "санкт-петербург", "спб", "петербург",
    "екатеринбург", "новосибирск", "нижний новгород", "самара", "уфа",
    "иннополис", "сочи", "краснодар", "ростов-на-дону", "томск", "пермь",
    "воронеж", "красноярск", "омск", "челябинск", "волгоград", "саратов",
    "тюмень", "ижевск", "владивосток", "калининград", "архангельск",
    "ярославль", "тула", "калуга", "обнинск", "долгопрудный", "химки",
    "зеленоград", "moscow", "kazan", "saint petersburg", "st petersburg",
    "innopolis", "yekaterinburg", "novosibirsk", "nizhny novgorod", "samara",
    "ufa", "krasnodar", "rostov-on-don", "tomsk", "perm", "voronezh",
    "krasnoyarsk", "omsk", "chelyabinsk", "volgograd", "saratov", "tyumen",
    "izhevsk", "vladivostok", "kaliningrad", "arkhangelsk", "yaroslavl",
    "tula", "kaluga", "obninsk", "dolgoprudny", "khimki", "zelenograd",
}


_VENUE_WORDS_RE = re.compile(
    r"парк|центр|университет|школ|офис|клуб|библиотек|музей|театр|арен|"
    r"стадион|кампус|it-|ит-|институт|академи|корпус",
    re.IGNORECASE,
)


def _parse_city(location: Optional[str]) -> Optional[str]:
    """Best-effort city extraction from a Google Calendar LOCATION.

    Most feeds use "Казань, ул. …", so the first comma segment is a
    useful fallback. Known city names win even when the venue comes
    first; obvious venue names are rejected rather than polluting the
    city filter.
    """
    if not location:
        return None
    clean = html.unescape(re.sub(r"<[^>]+>", " ", location)).strip()
    parts = [part.strip() for part in re.split(r"[,،]", clean) if part.strip()]
    for part in parts:
        if part.lower() in _CITY_NAMES:
            return part
    first = parts[0] if parts else clean
    if first.lower() in {"онлайн", "online", "webinar", "вебинар"}:
        return None
    if (
        len(first) <= 28
        and not _VENUE_WORDS_RE.search(first)
        and not re.search(
            r"\d|ул\.|улица|проспект|пр-т|д\.|дом|корпус",
            first,
            re.IGNORECASE,
        )
    ):
        return first
    return None


def _serialize(component, category: str = "activities") -> dict:
    uid = _text(component, "UID") or str(uuid.uuid4())
    # Deterministic UUID so /events/{id}/{slug} URLs stay stable across
    # refetches, and the frontend's id-vs-slug redirect check holds.
    event_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"ical:{uid}"))

    title = _text(component, "SUMMARY") or "Untitled event"
    location = _text(component, "LOCATION")
    url_field = _text(component, "URL")
    if url_field and not re.match(r"^https?://", url_field.strip(), re.IGNORECASE):
        url_field = None
    description, registration_url, tag_names, deadline_text = _parse_description(
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
    short = re.sub(r"<[^>]+>", " ", description or "").strip()[:200] or None

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
        "registration_deadline_text": deadline_text,
        "other_dates": [],
        "location_name": location,
        "address": None,
        "city": _parse_city(location),
        "categories": [category],
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


async def fetch_ical_events(
    locale: Optional[str] = None, category: Optional[str] = None
) -> list[dict]:
    """Fetch + parse + normalise one category feed. Raises RuntimeError
    on any failure so callers can decide whether to degrade or error out."""
    if ICalCalendar is None:
        raise RuntimeError(
            "icalendar library not installed — add it to requirements.txt"
        )
    cat = normalize_category(category)
    url = _validate_url(_feed_url(locale, cat))

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
            item = _serialize(comp, cat)
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
# One outbound fetch per TTL **per feed URL**. Activities and
# competitions often point at the same Google Calendar while the site is
# being configured; keying by URL means that feed is only fetched once
# even when both languages use it. An asyncio lock prevents a thundering
# herd after the TTL expires.
_cache: dict[str, dict] = {}
_locks: dict[str, asyncio.Lock] = {}


def _cache_entry(key: str) -> dict:
    entry = _cache.get(key)
    if entry is None:
        entry = {"data": None, "ts": 0.0}
        _cache[key] = entry
    return entry


async def _get_feed_events(
    locale: Optional[str], category: str, force: bool = False
) -> list[dict]:
    url = _feed_url(locale, category)
    entry = _cache_entry(url)
    lock = _locks.setdefault(url, asyncio.Lock())

    def fresh() -> bool:
        return (
            not force
            and entry["data"] is not None
            and time.time() - entry["ts"] < _ICAL_CACHE_TTL
        )

    if fresh():
        return entry["data"]

    async with lock:
        # Another request may have refreshed the feed while we waited.
        if fresh():
            return entry["data"]
        try:
            data = await fetch_ical_events(locale, category)
        except Exception:
            # Transient feed failure: keep serving the last good snapshot
            # instead of replacing the whole calendar with an error page.
            if entry["data"] is not None:
                return entry["data"]
            raise
        entry["data"] = data
        entry["ts"] = time.time()
        return data


def _sort_instant(value: Optional[datetime]) -> datetime:
    if value is None:
        return datetime.max.replace(tzinfo=timezone.utc)
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


async def get_cached_events(
    locale: Optional[str] = None, force: bool = False
) -> list[dict]:
    merged: dict[str, dict] = {}
    errors: list[Exception] = []

    # Group categories by feed URL so a shared calendar is fetched once.
    url_groups: dict[str, list[str]] = {}
    for category in CATEGORIES:
        try:
            url = _feed_url(locale, category)
        except RuntimeError:
            # This category simply has no feed in this environment.
            continue
        url_groups.setdefault(url, []).append(category)

    # No feed configured at all: an empty calendar is more honest than a
    # scary 502 while the deployment is being configured.
    if not url_groups:
        return []

    for url, categories in url_groups.items():
        try:
            items = await _get_feed_events(locale, categories[0], force)
        except Exception as exc:
            errors.append(exc)
            continue
        for item in items:
            copy = {
                **item,
                "categories": sorted(
                    set(item.get("categories", [])) | set(categories)
                ),
            }
            existing = merged.get(copy["id"])
            if existing:
                existing["categories"] = sorted(
                    set(existing.get("categories", []))
                    | set(copy["categories"])
                )
            else:
                merged[copy["id"]] = copy

    if errors and not merged:
        raise errors[0]

    out = list(merged.values())
    out.sort(key=lambda e: (e["start_at"] is None, _sort_instant(e["start_at"])))
    return out


def find_event(events: list[dict], slug_or_id: str) -> Optional[dict]:
    for e in events:
        if e["slug"] == slug_or_id or e["id"] == slug_or_id:
            return e
    return None
