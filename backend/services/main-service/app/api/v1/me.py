from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

from app.models.user import User
from app.shared.auth import get_current_user, hash_password, verify_password
from database.database import get_db

router = APIRouter(prefix="/me", tags=["me"])


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=120)
    surname: Optional[str] = Field(None, max_length=120)
    username: Optional[str] = Field(None, max_length=64)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=40)
    description: Optional[str] = Field(None, max_length=2000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    telegram_username: Optional[str] = Field(None, max_length=64)
    github_url: Optional[str] = Field(None, max_length=300)

    @field_validator("username")
    @classmethod
    def normalize_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip().lower().lstrip("@")
        if not v:
            return None
        if not all(c.isalnum() or c in ("_", "-") for c in v):
            raise ValueError("username may contain only letters, digits, _ and -")
        return v

    @field_validator("telegram_username")
    @classmethod
    def normalize_telegram(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        # Telegram handles: 5-32 chars, letters/digits/underscore.
        v = v.strip().lstrip("@")
        return v or None

    @field_validator("github_url")
    @classmethod
    def normalize_github(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if not (v.startswith("https://github.com/") or v.startswith("http://github.com/")):
            raise ValueError("github_url must be a github.com URL")
        return v


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


def _serialize(user: User) -> dict:
    """Single source of truth for what the frontend sees as `user`."""
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "phone": user.phone,
        "description": user.description,
        "avatar_url": user.avatar_url,
        "telegram_username": user.telegram_username,
        "github_url": user.github_url,
        "role": user.user_role.value if hasattr(user.user_role, "value") else user.user_role,
        "verified": user.verified,
        "blocked": user.blocked,
    }


@router.get("")
async def get_me(current_user: User = Depends(get_current_user)):
    return _serialize(current_user)


@router.patch("")
async def update_me(
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(current_user, key):
            setattr(current_user, key, value)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        msg = "Username or telegram handle already taken"
        detail = str(getattr(e, "orig", e))
        if "username" in detail:
            msg = "Username already taken"
        elif "telegram" in detail:
            msg = "Telegram handle already taken"
        raise HTTPException(409, msg)
    db.refresh(current_user)
    return _serialize(current_user)


@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
