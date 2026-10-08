import re
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
import logging

from app.models.user import User
from app.models.event import (
    Event, EventStatus, Organizer, EventType, EventDirection,
    EventSubdirection, EventTypeAssignment,
)
from app.schemas.event import (
    EventListItem, EventDetail, EventSubmitRequest,
    OrganizerOut, EventTypeOut, DirectionOut,
)
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/events", tags=["events"])
logger = logging.getLogger(__name__)


# ── Helpers ──────────────────────────────────────────────────────────────
TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
}

def slugify(text: str) -> str:
    text = text.lower().strip()
    # Transliterate Cyrillic to Latin
    transliterated = "".join(TRANSLIT_MAP.get(char, char) for char in text)
    # Remove non-alphanumeric, non-space, non-hyphen
    transliterated = re.sub(r"[^\w\s-]", "", transliterated, flags=re.UNICODE)
    transliterated = re.sub(r"[\s_]+", "-", transliterated)
    return re.sub(r"-+", "-", transliterated).strip("-")[:180]


def _unique_slug(db: Session, base: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    """Append -2, -3, … until the slug is free (respecting soft-deleted rows)."""
    slug = base
    n = 1
    while True:
        q = db.query(Event).filter(Event.slug == slug)
        if exclude_id:
            q = q.filter(Event.id != exclude_id)
        if not q.first():
            return slug
        n += 1
        slug = f"{base}-{n}"


def _serialize_event(event: Event, full: bool = False) -> dict:
    """Build the response dict from the ORM object."""
    tags = [
        {
            "id": str(s.id),
            "direction_id": str(s.direction_id),
            "name": s.name,
            "slug": s.slug,
            "sort_order": s.sort_order,
            "is_active": s.is_active,
        }
        for s in event.subdirections
        if s.deleted_at is None
    ]
    types = []
    for a in event.type_assignments:
        t = a.type
        types.append({
            "id": str(a.id),
            "type_id": str(a.type_id) if a.type_id else None,
            "custom_name": a.custom_name,
            "type": {
                "id": str(t.id),
                "name": t.name,
                "slug": t.slug,
                "icon": t.icon,
                "color": t.color,
                "sort_order": t.sort_order,
                "is_active": t.is_active,
            } if t else None,
        })
    data = {
        "id": str(event.id),
        "slug": event.slug,
        "title": event.title,
        "short_description": event.short_description,
        "cover_image_src": event.cover_image_src or "",
        "cover_video_src": event.cover_video_src,
        "start_at": event.start_at,
        "end_at": event.end_at,
        "registration_deadline": getattr(event, "registration_deadline", None),
        "other_dates": getattr(event, "other_dates", []) or [],
        "location_name": event.location_name,
        "address": event.address,
        "city": event.city,
        "price": event.price,
        "capacity": event.capacity,
        "registration_url": event.registration_url,
        "is_featured": event.is_featured,
        "status": event.status.value if hasattr(event.status, "value") else event.status,
        "custom_page": event.custom_page,
        "created_at": event.created_at,
        "updated_at": event.updated_at,
        "organizer": {
            "id": str(event.organizer.id),
            "name": event.organizer.name,
            "slug": event.organizer.slug,
            "color": event.organizer.color,
            "description": event.organizer.description,
            "is_active": event.organizer.is_active,
        } if event.organizer else None,
        "custom_organizer_name": getattr(event, "custom_organizer_name", None),
        "types": types,
        "tags": tags,
        "submitted_by": {
            "id": str(event.submitted_by.id),
            "name": event.submitted_by.name,
            "surname": event.submitted_by.surname,
            "username": event.submitted_by.username,
            "avatar_url": event.submitted_by.avatar_url,
        } if event.submitted_by else None,
        "submitted_by_id": str(event.submitted_by_id) if event.submitted_by_id else None,
    }
    if full:
        data.update({
            "description": event.description,
            "address": event.address,
            "metro": event.metro,
            "href": event.href,
            "mdx_content": event.mdx_content,
            "seo_title": event.seo_title,
            "meta_description": event.meta_description,
            "rejection_reason": event.rejection_reason,
            "reviewed_by_id": str(event.reviewed_by_id) if event.reviewed_by_id else None,
            "reviewed_at": event.reviewed_at,
        })
    return data


def _load_event(db: Session, slug: str) -> Optional[Event]:
    return (
        db.query(Event)
        .options(
            selectinload(Event.subdirections),
            selectinload(Event.type_assignments),
        )
        .filter(Event.slug == slug, Event.deleted_at.is_(None))
        .first()
    )


def _apply_types_and_tags(db: Session, event: Event, payload) -> None:
    """Replace the type assignments + subdirection links on an event."""
    # Types
    for a in list(event.type_assignments):
        db.delete(a)
    db.flush()
    for entry in payload.types:
        if entry.type_id:
            try:
                type_uuid = uuid.UUID(entry.type_id)
            except ValueError:
                raise HTTPException(400, f"Invalid type_id: {entry.type_id}")
            t = db.query(EventType).filter(
                EventType.id == type_uuid,
                EventType.deleted_at.is_(None),
            ).first()
            if not t:
                raise HTTPException(400, f"Type not found: {entry.type_id}")
            db.add(EventTypeAssignment(event_id=event.id, type_id=t.id))
        elif entry.custom_name:
            db.add(EventTypeAssignment(
                event_id=event.id,
                type_id=None,
                custom_name=entry.custom_name,
            ))
    # Subdirections (tags)
    subs: List[EventSubdirection] = []
    for sid in payload.subdirection_ids:
        try:
            sid_uuid = uuid.UUID(sid)
        except ValueError:
            raise HTTPException(400, f"Invalid subdirection_id: {sid}")
        s = db.query(EventSubdirection).filter(
            EventSubdirection.id == sid_uuid,
            EventSubdirection.deleted_at.is_(None),
        ).first()
        if not s:
            raise HTTPException(400, f"Subdirection not found: {sid}")
        subs.append(s)
    event.subdirections = subs


# ── Public reads ─────────────────────────────────────────────────────────
@router.get("", response_model=List[EventListItem])
async def list_public_events(
    db: Session = Depends(get_db),
    upcoming_only: bool = Query(False),
    limit: Optional[int] = Query(None, ge=1, le=500),
    tag: Optional[str] = Query(None),
    submitted_by_username: Optional[str] = Query(None),
):
    q = (
        db.query(Event)
        .options(
            selectinload(Event.subdirections),
            selectinload(Event.type_assignments),
        )
        .filter(
            Event.deleted_at.is_(None),
            Event.status == EventStatus.approved,
        )
        .order_by(Event.start_at.asc().nulls_last())
    )
    if upcoming_only:
        q = q.filter(or_(Event.end_at.is_(None), Event.end_at >= datetime.utcnow()))
    if tag:
        q = q.join(Event.subdirections).filter(EventSubdirection.slug == tag)
    if submitted_by_username:
        q = (
            q.join(User, User.id == Event.submitted_by_id)
            .filter(User.username == submitted_by_username.strip().lower().lstrip("@"))
        )
    if limit:
        q = q.limit(limit)
    return [_serialize_event(e) for e in q.all()]


@router.get("/me", response_model=List[EventListItem])
async def list_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(Event)
        .options(
            selectinload(Event.subdirections),
            selectinload(Event.type_assignments),
        )
        .filter(
            Event.deleted_at.is_(None),
            Event.submitted_by_id == current_user.id,
        )
        .order_by(Event.created_at.desc())
    )
    return [_serialize_event(e) for e in q.all()]


@router.get("/meta/organizers", response_model=List[OrganizerOut])
async def list_organizers_public(db: Session = Depends(get_db)):
    q = db.query(Organizer).filter(
        Organizer.deleted_at.is_(None),
        Organizer.is_active.is_(True),
    ).order_by(Organizer.name)
    return q.all()


@router.get("/meta/types", response_model=List[EventTypeOut])
async def list_types_public(db: Session = Depends(get_db)):
    q = db.query(EventType).filter(
        EventType.deleted_at.is_(None),
        EventType.is_active.is_(True),
    ).order_by(EventType.sort_order, EventType.name)
    return q.all()


@router.get("/meta/directions", response_model=List[DirectionOut])
async def list_directions_public(db: Session = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    q = (
        db.query(EventDirection)
        .options(selectinload(EventDirection.subdirections))
        .filter(
            EventDirection.deleted_at.is_(None),
            EventDirection.is_active.is_(True),
        )
        .order_by(EventDirection.sort_order, EventDirection.name)
    )
    directions = q.all()
    # Only return directions that have at least one live subdirection,
    # and filter out deleted/inactive subs — otherwise the frontend
    # renders an empty group and looks broken.
    out = []
    for d in directions:
        subs = [
            s for s in (d.subdirections or [])
            if getattr(s, "deleted_at", None) is None and s.is_active
        ]
        if not subs:
            continue
        d.subdirections = subs
        out.append(d)
    return out


@router.get("/{slug}", response_model=EventDetail)
async def get_public_event(slug: str, db: Session = Depends(get_db)):
    event = _load_event(db, slug)
    if not event or event.status != EventStatus.approved:
        raise HTTPException(404, "Event not found")
    return _serialize_event(event, full=True)


# ── User submission ──────────────────────────────────────────────────────
@router.post("/submit", response_model=EventDetail, status_code=201)
async def submit_event(
    payload: EventSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Authenticated users submit an event; it lands in `pending` for admin review."""
    slug_base = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, slug_base)

    org_id = None
    if payload.organizer_id:
        try:
            org_id = uuid.UUID(payload.organizer_id)
        except ValueError:
            raise HTTPException(400, "Invalid organizer_id")
        exists = db.query(Organizer).filter(
            Organizer.id == org_id,
            Organizer.deleted_at.is_(None),
        ).first()
        if not exists:
            raise HTTPException(400, "Organizer not found")

    event = Event(
        slug=slug,
        title=payload.title,
        short_description=payload.short_description,
        description=payload.description,
        cover_image_src=payload.cover_image_src,
        cover_video_src=payload.cover_video_src,
        href=payload.href,
        start_at=payload.start_at,
        end_at=payload.end_at,
        location_name=payload.location_name,
        address=payload.address,
        metro=payload.metro,
        city=payload.city,
        price=payload.price,
        capacity=payload.capacity,
        registration_url=payload.registration_url,
        organizer_id=org_id,
        status=EventStatus.pending,
        submitted_by_id=current_user.id,
    )
    db.add(event)
    db.flush()

    _apply_types_and_tags(db, event, payload)

    db.commit()
    db.refresh(event)
    logger.info(f"Event submitted: {event.id} by user {current_user.id}")
    return _serialize_event(event, full=True)
