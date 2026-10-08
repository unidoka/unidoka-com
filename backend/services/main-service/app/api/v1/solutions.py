from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.solution import Solution
from app.schemas.solution import SolutionOut
from database.database import get_db

router = APIRouter(prefix="/solutions", tags=["solutions"])


@router.get("", response_model=List[SolutionOut])
async def list_public_solutions(
    featured: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Solution).filter(
        Solution.deleted_at.is_(None),
        Solution.status == "published",
    ).order_by(Solution.sort_order, Solution.created_at.desc())
    if featured is True:
        q = q.filter(Solution.is_featured.is_(True))
    if category:
        q = q.filter(Solution.category == category)
    if limit:
        q = q.limit(limit)
    return [SolutionOut.model_validate(s) for s in q.all()]


@router.get("/{slug}", response_model=SolutionOut)
async def get_public_solution(slug: str, db: Session = Depends(get_db)):
    s = db.query(Solution).filter(
        Solution.slug == slug,
        Solution.deleted_at.is_(None),
        Solution.status == "published",
    ).first()
    if not s:
        raise HTTPException(404, "Solution not found")
    return SolutionOut.model_validate(s)
