"""Public read of active marketing placements.

Filters on three axes at once:
  • is_active = true
  • deleted_at IS NULL
  • now() inside [start_at, end_at] (open ends allowed)

Plus page targeting: the caller sends its current page (`events`,
`home`, …) and the query returns placements where `page` matches OR
`page` is `global`.

Returns a list, ordered by priority desc, because more than one
placement can be live for the same slot at the same time. The
frontend stacks them.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.marketing import MarketingPlacement
from app.schemas.marketing import PlacementOut
from database.database import get_db

router = APIRouter(prefix="/marketing", tags=["marketing"])


@router.get("/placements", response_model=List[PlacementOut])
async def list_active_placements(
    page: str = Query("global"),
    placement_type: Optional[str] = Query(
        None, pattern="^(top|card|toast|dialog)$"
    ),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    normalized_page = (page or "global").strip().lower().strip("/") or "global"

    q = db.query(MarketingPlacement).filter(
        MarketingPlacement.deleted_at.is_(None),
        MarketingPlacement.is_active.is_(True),
        or_(
            MarketingPlacement.start_at.is_(None),
            MarketingPlacement.start_at <= now,
        ),
        or_(
            MarketingPlacement.end_at.is_(None),
            MarketingPlacement.end_at >= now,
        ),
        or_(
            MarketingPlacement.page == normalized_page,
            MarketingPlacement.page == "global",
        ),
    ).order_by(
        MarketingPlacement.priority.desc(),
        MarketingPlacement.created_at.asc(),
    )

    if placement_type:
        q = q.filter(MarketingPlacement.placement_type == placement_type)

    return q.all()
