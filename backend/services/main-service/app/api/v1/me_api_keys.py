"""Owner-scoped API key management."""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.models.api_key import ApiKey
from app.models.user import User
from app.shared.api_key_crypto import (
    generate_api_key,
    hash_api_key,
    key_prefix,
)
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/me/api-keys", tags=["me-api-keys"])


class ApiKeyCreateIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    expires_at: Optional[datetime] = None


class ApiKeyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    key_prefix: str
    is_active: bool
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime


class ApiKeyCreatedOut(ApiKeyOut):
    full_key: str


def _serialize(row: ApiKey) -> dict:
    return {
        "id": str(row.id),
        "name": row.name,
        "key_prefix": row.key_prefix,
        "is_active": row.is_active,
        "expires_at": row.expires_at,
        "last_used_at": row.last_used_at,
        "created_at": row.created_at,
    }


@router.get("", response_model=List[ApiKeyOut])
async def list_my_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(ApiKey)
        .filter(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
        .all()
    )
    return [_serialize(r) for r in rows]


@router.post("", response_model=ApiKeyCreatedOut, status_code=201)
async def create_my_api_key(
    payload: ApiKeyCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.expires_at and payload.expires_at < datetime.utcnow():
        raise HTTPException(422, "expires_at must be in the future")

    raw = generate_api_key()
    row = ApiKey(
        user_id=current_user.id,
        name=payload.name.strip(),
        key_prefix=key_prefix(raw),
        key_hash=hash_api_key(raw),
        expires_at=payload.expires_at,
        is_active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    out = _serialize(row)
    out["full_key"] = raw
    return out


@router.delete("/{key_id}", status_code=204)
async def revoke_my_api_key(
    key_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(ApiKey)
        .filter(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(404, "API key not found")
    row.is_active = False
    db.commit()
    return None


