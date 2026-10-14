import re
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.marketing import MarketingPlacement
from app.schemas.marketing import PlacementPayload, PlacementOut
from app.shared.auth import get_current_user
from app.shared.permissions import require_permission
from database.database import get_db

router = APIRouter(prefix="/admin/marketing/placements", tags=["admin-marketing"])


# Bound permission dependency. Enforced per-request on the DB-loaded User — no JWT caching, so a revoke is immediate.
_require_admin = require_permission("admin.marketing")


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:180] or "placement"


def _unique_slug(
    db: Session, base: str, exclude_id: Optional[uuid.UUID] = None
) -> str:
    slug = base
    n = 1
    while True:
        q = db.query(MarketingPlacement).filter(
            MarketingPlacement.slug == slug
        )
        if exclude_id:
            q = q.filter(MarketingPlacement.id != exclude_id)
        if not q.first():
            return slug
        n += 1
        slug = f"{base}-{n}"


@router.get("", response_model=List[PlacementOut])
async def list_placements(
    q: Optional[str] = Query(None),
    page: Optional[str] = Query(None),
    placement_type: Optional[str] = Query(
        None, pattern="^(top|card|toast|dialog)$"
    ),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = (
        db.query(MarketingPlacement)
        .filter(MarketingPlacement.deleted_at.is_(None))
        # Active first, then highest priority, then newest. Gives the
        # admin a list ordered the way the public site would render them.
        .order_by(
            MarketingPlacement.is_active.desc(),
            MarketingPlacement.priority.desc(),
            MarketingPlacement.created_at.desc(),
        )
    )
    if q:
        like = f"%{q}%"
        query = query.filter(MarketingPlacement.title.ilike(like))
    if page:
        query = query.filter(MarketingPlacement.page == page.strip().lower())
    if placement_type:
        query = query.filter(
            MarketingPlacement.placement_type == placement_type
        )
    if active_only:
        query = query.filter(MarketingPlacement.is_active.is_(True))
    return query.all()


@router.get("/{slug}", response_model=PlacementOut)
async def get_placement(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    p = (
        db.query(MarketingPlacement)
        .filter(
            MarketingPlacement.slug == slug,
            MarketingPlacement.deleted_at.is_(None),
        )
        .first()
    )
    if not p:
        raise HTTPException(404, "Placement not found")
    return p


@router.post("", response_model=PlacementOut, status_code=201)
async def create_placement(
    payload: PlacementPayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    # Validate the window up front. An end before a start means the
    # placement is invisible for its entire life and the admin would
    # have to guess why — better to reject at write time.
    if payload.start_at and payload.end_at and payload.end_at < payload.start_at:
        raise HTTPException(422, "end_at must be after start_at")

    slug = _unique_slug(db, _slugify(payload.slug or payload.title))
    data = payload.model_dump()
    data.pop("slug", None)
    p = MarketingPlacement(slug=slug, **data)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.patch("/{slug}", response_model=PlacementOut)
async def update_placement(
    slug: str,
    payload: PlacementPayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    p = (
        db.query(MarketingPlacement)
        .filter(
            MarketingPlacement.slug == slug,
            MarketingPlacement.deleted_at.is_(None),
        )
        .first()
    )
    if not p:
        raise HTTPException(404, "Placement not found")

    data = payload.model_dump(exclude_unset=True)

    # Re-check the window against the post-update values. A PATCH that
    # only changes `end_at` still has to be validated against the
    # stored `start_at`, so resolve both before comparing.
    new_start = data.get("start_at", p.start_at)
    new_end = data.get("end_at", p.end_at)
    if new_start and new_end and new_end < new_start:
        raise HTTPException(422, "end_at must be after start_at")

    new_slug = data.pop("slug", None)
    if new_slug:
        p.slug = _unique_slug(db, _slugify(new_slug), exclude_id=p.id)

    for k, v in data.items():
        if hasattr(p, k):
            setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return p


@router.delete("/{slug}", status_code=204)
async def delete_placement(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    p = (
        db.query(MarketingPlacement)
        .filter(
            MarketingPlacement.slug == slug,
            MarketingPlacement.deleted_at.is_(None),
        )
        .first()
    )
    if not p:
        raise HTTPException(404, "Placement not found")
    p.deleted_at = datetime.utcnow()
    db.commit()
    return None
