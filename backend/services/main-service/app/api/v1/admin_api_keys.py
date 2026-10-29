"""Admin-wide API key list. Gated by `admin.apikeys`."""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.api_key import ApiKey
from app.models.user import User
from app.shared.auth import get_current_user
from app.shared.permissions import require_permission
from database.database import get_db

router = APIRouter(prefix="/admin/api-keys", tags=["admin-api-keys"])
_require_admin = require_permission("admin.apikeys")


class AdminApiKeyOut(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime
    user_id: str
    user_email: str
    user_name: Optional[str] = None


def _serialize(row: ApiKey, user: User) -> dict:
    return {
        "id": str(row.id),
        "name": row.name,
        "key_prefix": row.key_prefix,
        "is_active": row.is_active,
        "expires_at": row.expires_at,
        "last_used_at": row.last_used_at,
        "created_at": row.created_at,
        "user_id": str(user.id),
        "user_email": user.email,
        "user_name": (" ".join(filter(None, [user.name, user.surname])) or None),
    }


@router.get("", response_model=List[AdminApiKeyOut])
async def list_all_api_keys(
    q: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(ApiKey, User).join(User, User.id == ApiKey.user_id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                ApiKey.name.ilike(like),
                ApiKey.key_prefix.ilike(like),
                User.email.ilike(like),
                User.name.ilike(like),
                User.surname.ilike(like),
            )
        )
    if active_only:
        query = query.filter(ApiKey.is_active.is_(True))
    rows = query.order_by(ApiKey.created_at.desc()).all()
    return [_serialize(row, user) for row, user in rows]


@router.delete("/{key_id}", status_code=204)
async def admin_revoke_api_key(
    key_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    row = db.get(ApiKey, key_id)
    if not row:
        raise HTTPException(404, "API key not found")
    row.is_active = False
    db.commit()
    return None


