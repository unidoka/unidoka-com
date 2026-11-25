from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.article import Article
from app.schemas.article import ArticleDetailOut, ArticleOut
from database.database import get_db

router = APIRouter(prefix="/articles", tags=["articles"])


def _published_translations(db: Session, a: Article) -> list[dict]:
    rows = db.query(Article).filter(
        Article.translation_group_id == a.translation_group_id,
        Article.id != a.id,
        Article.deleted_at.is_(None),
        Article.status == "published",
    ).all()
    return [
        {"lang": r.lang, "slug": r.slug, "title": r.title, "status": r.status}
        for r in rows
    ]


@router.get("", response_model=List[ArticleOut])
async def list_public_articles(
    featured: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    lang: Optional[str] = Query(None, pattern="^(ru|en)$"),
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
    if lang:
        q = q.filter(Article.lang == lang)
    rows = q.all()
    if tag:
        rows = [
            a for a in rows
            if any((t or {}).get("title") == tag for t in (a.tags or []))
        ]
    if limit:
        rows = rows[:limit]
    return [ArticleOut.model_validate(a) for a in rows]


@router.get("/{slug}", response_model=ArticleDetailOut)
async def get_public_article(slug: str, db: Session = Depends(get_db)):
    a = db.query(Article).filter(
        Article.slug == slug,
        Article.deleted_at.is_(None),
        Article.status != "archived",
    ).first()
    if not a:
        raise HTTPException(404, "Article not found")
    return ArticleDetailOut(
        **ArticleOut.model_validate(a).model_dump(),
        translations=_published_translations(db, a),
    )
