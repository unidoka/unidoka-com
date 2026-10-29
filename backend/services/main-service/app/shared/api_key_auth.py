"""Auth dependency: accept either Bearer JWT or `X-API-Key`.

Only admin event endpoints use this. The rest of the admin surface
keeps `get_current_user` (Bearer-only), so a leaked API key cannot
reach user CRUD, orders, solutions, etc.

Fallback order:
  1. If `Authorization: Bearer <token>` is present and valid -> user.
  2. Else if `X-API-Key: <key>` is present and valid -> user.
  3. Else 401.
"""
import os
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.models.api_key import ApiKey
from app.models.user import User
from app.shared.api_key_crypto import hash_api_key
from database.database import get_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

_optional_bearer = HTTPBearer(auto_error=False)


def _try_bearer(token: str, db: Session) -> Optional[User]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        user_id = UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    user = db.get(User, user_id)
    if user is None or user.blocked:
        return None
    return user


def _try_api_key(raw: str, db: Session) -> Optional[User]:
    h = hash_api_key(raw)
    row = (
        db.query(ApiKey)
        .filter(ApiKey.key_hash == h, ApiKey.is_active.is_(True))
        .first()
    )
    if not row:
        return None
    if row.expires_at and row.expires_at < datetime.utcnow():
        return None
    user = db.get(User, row.user_id)
    if user is None or user.blocked:
        return None
    row.last_used_at = datetime.utcnow()
    db.commit()
    return user


async def get_current_user_or_api_key(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials:
        user = _try_bearer(credentials.credentials, db)
        if user:
            return user

    api_key = request.headers.get("X-API-Key")
    if api_key:
        user = _try_api_key(api_key.strip(), db)
        if user:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required: Bearer token or X-API-Key header",
        headers={"WWW-Authenticate": "Bearer"},
    )
