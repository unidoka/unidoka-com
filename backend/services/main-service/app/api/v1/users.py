"""
Public user profile. Only exposes fields safe to show to strangers:
no email, no phone, no internal role/status flags beyond `verified`.
Blocked users return 404 (indistinguishable from "doesn't exist").
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.user import User
from database.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])


def _public(user: User) -> dict:
    return {
        "id": str(user.id),
        "username": user.username,
        "name": user.name,
        "surname": user.surname,
        "description": user.description,
        "avatar_url": user.avatar_url,
        "telegram_username": user.telegram_username,
        "github_url": user.github_url,
        "role": user.user_role.value
        if hasattr(user.user_role, "value")
        else user.user_role,
        "verified": bool(user.verified),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.get("/by-username/{username}")
async def get_public_user(username: str, db: Session = Depends(get_db)):
    handle = username.strip().lstrip("@").lower()
    if not handle:
        raise HTTPException(404, "User not found")

    user = (
        db.query(User)
        .filter(
            func.lower(User.username) == handle,
            or_(User.blocked.is_(None), User.blocked.is_(False)),
        )
        .first()
    )
    if not user:
        logger.warning("Public user lookup MISS: %r", handle)
        raise HTTPException(404, "User not found")
    return _public(user)
