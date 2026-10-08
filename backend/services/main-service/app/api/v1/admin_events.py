import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError
import logging

from app.models.user import User, UserRole
from app.models.event import (
    Event, EventStatus, Organizer, EventType, EventDirection,
    EventSubdirection,
)
from app.schemas.event import (
    EventDetail, EventListItem, EventAdminRequest, EventRejectRequest,
    OrganizerRequest, EventTypeRequest, DirectionRequest, SubdirectionRequest,
    OrganizerOut, EventTypeOut, DirectionOut, SubdirectionOut,
)
from app.api.v1.events import _serialize_event, _unique_slug, _apply_types_and_tags, slugify
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin", tags=["admin-events"])
logger = logging.getLogger(__name__)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(403, "Admin role required")
    return current_user


def _load_event_any(db: Session, slug: str) -> Event:
    e = (
        db.query(Event)
        .options(
            selectinload(Event.subdirections),
            selectinload(Event.type_assignments),
        )
        .filter(Event.slug == slug, Event.deleted_at.is_(None))
        .first()
    )
    if not e:
        raise HTTPException(404, "Event not found")
    return e


# ═══════════════════════ EVENTS CRUD ═════════════════════════════════════
@router.get("/events", response_model=List[EventListItem])
async def admin_list_events(
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    organizer_id: Optional[str] = Query(None),
    event_type_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = (
        db.query(Event)
        .options(
            selectinload(Event.subdirections),
            selectinload(Event.type_assignments),
        )
        .filter(Event.deleted_at.is_(None))
        .order_by(Event.created_at.desc())
    )
    if q:
        like = f"%{q}%"
        query = query.filter(Event.title.ilike(like))
    if status:
        query = query.filter(Event.status == EventStatus(status))
    if organizer_id:
        try:
            org_uuid = uuid.UUID(organizer_id)
            query = query.filter(Event.organizer_id == org_uuid)
        except ValueError:
            pass
    if event_type_id:
        try:
            type_uuid = uuid.UUID(event_type_id)
            query = query.join(EventTypeAssignment).filter(
                EventTypeAssignment.type_id == type_uuid
            )
        except ValueError:
            pass
    return [_serialize_event(e, full=True) for e in query.all()]


@router.get("/events/{slug}", response_model=EventDetail)
async def admin_get_event(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return _serialize_event(_load_event_any(db, slug), full=True)


@router.post("/events", response_model=EventDetail, status_code=201)
async def admin_create_event(
    payload: EventAdminRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    slug_base = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, slug_base)

    org_id = _uuid_or_none(payload.organizer_id, "organizer_id")
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
        custom_organizer_name=payload.custom_organizer_name,
        custom_page=payload.custom_page,
        is_featured=payload.is_featured,
        seo_title=payload.seo_title,
        meta_description=payload.meta_description,
        mdx_content=payload.mdx_content,
        status=EventStatus(payload.status),
        reviewed_by_id=admin.id,
        reviewed_at=datetime.utcnow(),
    )
    db.add(event)
    db.flush()
    _apply_types_and_tags(db, event, payload)
    db.commit()
    db.refresh(event)
    return _serialize_event(event, full=True)


@router.patch("/events/{slug}", response_model=EventDetail)
async def admin_update_event(
    slug: str,
    payload: EventAdminRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = _load_event_any(db, slug)
    for field in (
        "title", "short_description", "description",
        "cover_image_src", "cover_video_src", "href",
        "start_at", "end_at", "registration_deadline", "other_dates",
        "location_name", "address", "metro", "city",
        "price", "capacity", "registration_url",
        "custom_organizer_name",
        "custom_page", "is_featured", "seo_title",
        "meta_description", "mdx_content",
    ):
        setattr(event, field, getattr(payload, field))
    if payload.organizer_id:
        event.organizer_id = _uuid_or_none(payload.organizer_id, "organizer_id")
    elif payload.organizer_id is None:
        event.organizer_id = None
    if payload.status != event.status.value:
        event.status = EventStatus(payload.status)
        event.reviewed_by_id = admin.id
        event.reviewed_at = datetime.utcnow()
    _apply_types_and_tags(db, event, payload)
    db.commit()
    db.refresh(event)
    return _serialize_event(event, full=True)


@router.delete("/events/{slug}", status_code=204)
async def admin_delete_event(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    event = _load_event_any(db, slug)
    event.deleted_at = datetime.utcnow()
    db.commit()
    return None


@router.post("/events/{slug}/approve", response_model=EventDetail)
async def admin_approve_event(
    slug: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = _load_event_any(db, slug)
    event.status = EventStatus.approved
    event.rejection_reason = None
    event.reviewed_by_id = admin.id
    event.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return _serialize_event(event, full=True)


@router.post("/events/{slug}/reject", response_model=EventDetail)
async def admin_reject_event(
    slug: str,
    payload: EventRejectRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = _load_event_any(db, slug)
    event.status = EventStatus.rejected
    event.rejection_reason = payload.reason
    event.reviewed_by_id = admin.id
    event.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return _serialize_event(event, full=True)


# ═══════════════════════ ORGANIZERS ══════════════════════════════════════
@router.get("/organizers", response_model=List[OrganizerOut])
async def admin_list_organizers(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Organizer)
        .filter(Organizer.deleted_at.is_(None))
        .order_by(Organizer.name)
        .all()
    )


@router.post("/organizers", response_model=OrganizerOut, status_code=201)
async def admin_create_organizer(
    payload: OrganizerRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    slug = slugify(payload.slug or payload.name)
    owner_uuid = None
    if payload.owner_id:
        try:
            owner_uuid = uuid.UUID(payload.owner_id)
        except ValueError:
            raise HTTPException(400, "Invalid owner_id")
    o = Organizer(
        name=payload.name,
        slug=slug,
        color=payload.color,
        avatar_url=payload.avatar_url,
        owner_id=owner_uuid,
        description=payload.description,
        is_active=payload.is_active,
    )
    db.add(o)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Organizer with this name or slug already exists")
    db.refresh(o)
    return o


@router.patch("/organizers/{org_id}", response_model=OrganizerOut)
async def admin_update_organizer(
    org_id: uuid.UUID,
    payload: OrganizerRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    o = db.query(Organizer).filter(
        Organizer.id == org_id, Organizer.deleted_at.is_(None),
    ).first()
    if not o:
        raise HTTPException(404, "Organizer not found")
    o.name = payload.name
    if payload.slug:
        o.slug = slugify(payload.slug)
    o.color = payload.color
    o.avatar_url = payload.avatar_url
    if payload.owner_id is not None:
        if payload.owner_id == "":
            o.owner_id = None
        else:
            try:
                o.owner_id = uuid.UUID(payload.owner_id)
            except ValueError:
                raise HTTPException(400, "Invalid owner_id")
    o.description = payload.description
    o.is_active = payload.is_active
    db.commit()
    db.refresh(o)
    return o


@router.delete("/organizers/{org_id}", status_code=204)
async def admin_delete_organizer(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    o = db.query(Organizer).filter(
        Organizer.id == org_id, Organizer.deleted_at.is_(None),
    ).first()
    if not o:
        raise HTTPException(404, "Organizer not found")
    o.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ═══════════════════════ TYPES ═══════════════════════════════════════════
@router.get("/event-types", response_model=List[EventTypeOut])
async def admin_list_types(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(EventType)
        .filter(EventType.deleted_at.is_(None))
        .order_by(EventType.sort_order, EventType.name)
        .all()
    )


@router.post("/event-types", response_model=EventTypeOut, status_code=201)
async def admin_create_type(
    payload: EventTypeRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    t = EventType(
        name=payload.name,
        slug=slugify(payload.slug or payload.name),
        icon=payload.icon,
        color=payload.color,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(t)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Type with this name or slug already exists")
    db.refresh(t)
    return t


@router.patch("/event-types/{type_id}", response_model=EventTypeOut)
async def admin_update_type(
    type_id: uuid.UUID,
    payload: EventTypeRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    t = db.query(EventType).filter(
        EventType.id == type_id, EventType.deleted_at.is_(None),
    ).first()
    if not t:
        raise HTTPException(404, "Type not found")
    t.name = payload.name
    if payload.slug:
        t.slug = slugify(payload.slug)
    t.icon = payload.icon
    t.color = payload.color
    t.sort_order = payload.sort_order
    t.is_active = payload.is_active
    db.commit()
    db.refresh(t)
    return t


@router.delete("/event-types/{type_id}", status_code=204)
async def admin_delete_type(
    type_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    t = db.query(EventType).filter(
        EventType.id == type_id, EventType.deleted_at.is_(None),
    ).first()
    if not t:
        raise HTTPException(404, "Type not found")
    t.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ═══════════════════════ DIRECTIONS + SUBDIRECTIONS ═════════════════════
@router.get("/directions", response_model=List[DirectionOut])
async def admin_list_directions(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(EventDirection)
        .filter(EventDirection.deleted_at.is_(None))
        .order_by(EventDirection.sort_order, EventDirection.name)
        .all()
    )


@router.post("/directions", response_model=DirectionOut, status_code=201)
async def admin_create_direction(
    payload: DirectionRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    d = EventDirection(
        name=payload.name,
        slug=slugify(payload.slug or payload.name),
        emoji=payload.emoji,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(d)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Direction with this name or slug already exists")
    db.refresh(d)
    return d


@router.patch("/directions/{direction_id}", response_model=DirectionOut)
async def admin_update_direction(
    direction_id: uuid.UUID,
    payload: DirectionRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    d = db.query(EventDirection).filter(
        EventDirection.id == direction_id, EventDirection.deleted_at.is_(None),
    ).first()
    if not d:
        raise HTTPException(404, "Direction not found")
    d.name = payload.name
    if payload.slug:
        d.slug = slugify(payload.slug)
    d.emoji = payload.emoji
    d.sort_order = payload.sort_order
    d.is_active = payload.is_active
    db.commit()
    db.refresh(d)
    return d


@router.delete("/directions/{direction_id}", status_code=204)
async def admin_delete_direction(
    direction_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    d = db.query(EventDirection).filter(
        EventDirection.id == direction_id, EventDirection.deleted_at.is_(None),
    ).first()
    if not d:
        raise HTTPException(404, "Direction not found")
    d.deleted_at = datetime.utcnow()
    # Cascade soft-delete to subdirections
    for s in d.subdirections:
        s.deleted_at = datetime.utcnow()
    db.commit()
    return None


@router.post(
    "/directions/{direction_id}/subdirections",
    response_model=SubdirectionOut,
    status_code=201,
)
async def admin_create_subdirection(
    direction_id: uuid.UUID,
    payload: SubdirectionRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    d = db.query(EventDirection).filter(
        EventDirection.id == direction_id, EventDirection.deleted_at.is_(None),
    ).first()
    if not d:
        raise HTTPException(404, "Direction not found")
    s = EventSubdirection(
        direction_id=direction_id,
        name=payload.name,
        slug=slugify(payload.slug or payload.name),
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(s)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Subdirection with this slug already exists")
    db.refresh(s)
    return s


@router.patch("/subdirections/{sub_id}", response_model=SubdirectionOut)
async def admin_update_subdirection(
    sub_id: uuid.UUID,
    payload: SubdirectionRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    s = db.query(EventSubdirection).filter(
        EventSubdirection.id == sub_id, EventSubdirection.deleted_at.is_(None),
    ).first()
    if not s:
        raise HTTPException(404, "Subdirection not found")
    s.name = payload.name
    if payload.slug:
        s.slug = slugify(payload.slug)
    s.sort_order = payload.sort_order
    s.is_active = payload.is_active
    db.commit()
    db.refresh(s)
    return s


@router.delete("/subdirections/{sub_id}", status_code=204)
async def admin_delete_subdirection(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    s = db.query(EventSubdirection).filter(
        EventSubdirection.id == sub_id, EventSubdirection.deleted_at.is_(None),
    ).first()
    if not s:
        raise HTTPException(404, "Subdirection not found")
    s.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ── Utilities ────────────────────────────────────────────────────────────



def _uuid_or_none(v: Optional[str], field: str) -> Optional[uuid.UUID]:
    if not v:
        return None
    try:
        return uuid.UUID(v)
    except ValueError:
        raise HTTPException(400, f"Invalid {field}")
