from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.article import Article
from app.schemas.article import ArticleOut
from database.database import get_db

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=List[ArticleOut])
async def list_public_articles(
    featured: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Article).filter(
        Article.deleted_at.is_(None),
        Article.status != "archived",
    ).order_by(Article.sort_order, Article.created_at.desc())
    if featured is True:
        q = q.filter(Article.is_featured.is_(True))
    if category:
        q = q.filter(Article.category == category)
    rows = q.all()
    if tag:
        rows = [
            a for a in rows
            if any((t or {}).get("title") == tag for t in (a.tags or []))
        ]
    if limit:
        rows = rows[:limit]
    return [ArticleOut.model_validate(a) for a in rows]


@router.get("/{slug}", response_model=ArticleOut)
async def get_public_article(slug: str, db: Session = Depends(get_db)):
    a = db.query(Article).filter(
        Article.slug == slug,
        Article.deleted_at.is_(None),
        Article.status != "archived",
    ).first()
    if not a:
        raise HTTPException(404, "Article not found")
    return ArticleOut.model_validate(a)
