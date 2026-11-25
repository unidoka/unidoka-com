import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.article import Article
from app.schemas.article import ArticleDetailOut, ArticlePayload, ArticleOut
from app.shared.permissions import require_permission
from app.shared.slug import slugify
from database.database import get_db

router = APIRouter(prefix="/admin/articles", tags=["admin-articles"])


_require_admin = require_permission("admin.articles")


def _slugify(text: str) -> str:
    return slugify(text, fallback="article")


def _unique_slug(db: Session, base: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    slug = base
    n = 1
    while True:
        q = db.query(Article).filter(Article.slug == slug)
        if exclude_id:
            q = q.filter(Article.id != exclude_id)
        if not q.first():
            return slug
        n += 1
        slug = f"{base}-{n}"


def _serialize(a: Article) -> ArticleOut:
    return ArticleOut.model_validate(a)


def _translations(db: Session, a: Article) -> list[dict]:
    rows = db.query(Article).filter(
        Article.translation_group_id == a.translation_group_id,
        Article.id != a.id,
        Article.deleted_at.is_(None),
    ).all()
    return [
        {"lang": r.lang, "slug": r.slug, "title": r.title, "status": r.status}
        for r in rows
    ]


def _serialize_detail(db: Session, a: Article) -> ArticleDetailOut:
    return ArticleDetailOut(
        **_serialize(a).model_dump(),
        translations=_translations(db, a),
    )


@router.get("", response_model=List[ArticleOut])
async def list_articles(
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(draft|published|archived)$"),
    lang: Optional[str] = Query(None, pattern="^(ru|en)$"),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(Article).filter(Article.deleted_at.is_(None)).order_by(
        Article.sort_order, Article.created_at.desc()
    )
    if q:
        query = query.filter(Article.title.ilike(f"%{q}%"))
    if status:
        query = query.filter(Article.status == status)
    if lang:
        query = query.filter(Article.lang == lang)
    return [_serialize(a) for a in query.all()]


@router.get("/{slug}", response_model=ArticleDetailOut)
async def get_article(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    a = db.query(Article).filter(
        Article.slug == slug, Article.deleted_at.is_(None)
    ).first()
    if not a:
        raise HTTPException(404, "Article not found")
    return _serialize_detail(db, a)


@router.post("", response_model=ArticleOut, status_code=201)
async def create_article(
    payload: ArticlePayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    slug = _unique_slug(db, _slugify(payload.slug or payload.title))
    data = payload.model_dump()
    data.pop("slug", None)

    article_id = uuid.uuid4()
    group_id = data.pop("translation_group_id", None) or article_id
    if group_id != article_id:
        sibling = db.query(Article).filter(
            Article.translation_group_id == group_id,
            Article.lang == data.get("lang"),
            Article.deleted_at.is_(None),
        ).first()
        if sibling:
            raise HTTPException(
                409, f"Версия на языке «{data.get('lang')}» уже существует"
            )

    if data.get("status") == "published" and not data.get("published_at"):
        data["published_at"] = datetime.utcnow()

    a = Article(
        id=article_id, slug=slug, translation_group_id=group_id, **data
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return _serialize(a)


@router.patch("/{slug}", response_model=ArticleDetailOut)
async def update_article(
    slug: str,
    payload: ArticlePayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    a = db.query(Article).filter(
        Article.slug == slug, Article.deleted_at.is_(None)
    ).first()
    if not a:
        raise HTTPException(404, "Article not found")

    data = payload.model_dump(exclude_unset=True)
    data.pop("translation_group_id", None)
    new_slug = data.pop("slug", None)
    if new_slug:
        a.slug = _unique_slug(db, _slugify(new_slug), exclude_id=a.id)

    new_lang = data.get("lang")
    if new_lang and new_lang != a.lang:
        sibling = db.query(Article).filter(
            Article.translation_group_id == a.translation_group_id,
            Article.lang == new_lang,
            Article.id != a.id,
            Article.deleted_at.is_(None),
        ).first()
        if sibling:
            raise HTTPException(409, f"Версия на языке «{new_lang}» уже существует")

    if data.get("status") == "published" and not a.published_at and not data.get("published_at"):
        data["published_at"] = datetime.utcnow()

    for k, v in data.items():
        if hasattr(a, k):
            setattr(a, k, v)

    db.commit()
    db.refresh(a)
    return _serialize_detail(db, a)


@router.delete("/{slug}", status_code=204)
async def delete_article(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    a = db.query(Article).filter(
        Article.slug == slug, Article.deleted_at.is_(None)
    ).first()
    if not a:
        raise HTTPException(404, "Article not found")
    a.deleted_at = datetime.utcnow()
    db.commit()
    return None
