import re
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.solution import Solution
from app.schemas.solution import SolutionPayload, SolutionOut
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin/solutions", tags=["admin-solutions"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(403, "Admin role required")
    return current_user


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:180]


def _unique_slug(db: Session, base: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    slug = base
    n = 1
    while True:
        q = db.query(Solution).filter(Solution.slug == slug)
        if exclude_id:
            q = q.filter(Solution.id != exclude_id)
        if not q.first():
            return slug
        n += 1
        slug = f"{base}-{n}"


def _serialize(s: Solution) -> SolutionOut:
    return SolutionOut.model_validate(s)


@router.get("", response_model=List[SolutionOut])
async def list_solutions(
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(draft|published|archived)$"),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(Solution).filter(Solution.deleted_at.is_(None)).order_by(
        Solution.sort_order, Solution.created_at.desc()
    )
    if q:
        query = query.filter(Solution.title.ilike(f"%{q}%"))
    if status:
        query = query.filter(Solution.status == status)
    return [_serialize(s) for s in query.all()]


@router.get("/{slug}", response_model=SolutionOut)
async def get_solution(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    s = db.query(Solution).filter(
        Solution.slug == slug, Solution.deleted_at.is_(None)
    ).first()
    if not s:
        raise HTTPException(404, "Solution not found")
    return _serialize(s)


@router.post("", response_model=SolutionOut, status_code=201)
async def create_solution(
    payload: SolutionPayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    slug = _unique_slug(db, _slugify(payload.slug or payload.title))
    data = payload.model_dump()
    data.pop("slug", None)
    # Normalize client_id
    if data.get("client_id"):
        try:
            data["client_id"] = uuid.UUID(data["client_id"])
        except (ValueError, TypeError):
            data["client_id"] = None
    s = Solution(slug=slug, **data)
    db.add(s)
    db.commit()
    db.refresh(s)
    return _serialize(s)


@router.patch("/{slug}", response_model=SolutionOut)
async def update_solution(
    slug: str,
    payload: SolutionPayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    s = db.query(Solution).filter(
        Solution.slug == slug, Solution.deleted_at.is_(None)
    ).first()
    if not s:
        raise HTTPException(404, "Solution not found")

    data = payload.model_dump(exclude_unset=True)
    # Handle slug rename
    new_slug = data.pop("slug", None)
    if new_slug:
        s.slug = _unique_slug(db, _slugify(new_slug), exclude_id=s.id)
    # Normalize client_id
    if "client_id" in data and data["client_id"]:
        try:
            data["client_id"] = uuid.UUID(data["client_id"])
        except (ValueError, TypeError):
            data["client_id"] = None

    for k, v in data.items():
        if hasattr(s, k):
            setattr(s, k, v)

    db.commit()
    db.refresh(s)
    return _serialize(s)


@router.delete("/{slug}", status_code=204)
async def delete_solution(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    s = db.query(Solution).filter(
        Solution.slug == slug, Solution.deleted_at.is_(None)
    ).first()
    if not s:
        raise HTTPException(404, "Solution not found")
    s.deleted_at = datetime.utcnow()
    db.commit()
    return None
