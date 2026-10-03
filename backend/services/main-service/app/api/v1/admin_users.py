"""
Admin user management.

Role hierarchy enforced here:
  • root  — full CRUD on every user, can change roles, can delete
  • admin — can list/read/create/update/delete any user EXCEPT other
            admins and roots. Cannot promote anyone to admin/root.
  • user/client — 403 on everything.

Self-protection rules:
  • You cannot delete yourself.
  • You cannot change your own role.
  • You cannot demote or delete the last remaining root.

Passwords are hashed with the same helper the auth flow uses. On PATCH,
`password` is optional — leaving it blank preserves the existing hash.
"""
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.shared.auth import get_current_user, hash_password
from database.database import get_db

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


# ── Schemas ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    verified: bool
    blocked: bool
    telegram_chat_id: Optional[str] = None
    email_enabled: bool = True
    telegram_enabled: bool = True
    receives_order_notifications: bool = False
    created_at: Optional[str] = None


class UserCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = Field(None, max_length=120)
    surname: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)
    role: str = Field("user", pattern="^(client|user|admin|root)$")
    verified: bool = True
    blocked: bool = False

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class UserUpdateIn(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    name: Optional[str] = Field(None, max_length=120)
    surname: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)
    avatar_url: Optional[str] = Field(None, max_length=500)
    role: Optional[str] = Field(None, pattern="^(client|user|admin|root)$")
    verified: Optional[bool] = None
    blocked: Optional[bool] = None
    telegram_chat_id: Optional[str] = None
    email_enabled: Optional[bool] = None
    telegram_enabled: Optional[bool] = None

    @field_validator("password")
    @classmethod
    def check_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


# ── Guards ───────────────────────────────────────────────────────────

def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    role = current_user.user_role
    if role not in (UserRole.admin, UserRole.root):
        raise HTTPException(403, "Admin role required")
    return current_user


def _is_root(user: User) -> bool:
    return user.user_role == UserRole.root


def _role_value(u: User) -> str:
    return u.user_role.value if hasattr(u.user_role, "value") else str(u.user_role)


def _can_touch(actor: User, target: User) -> bool:
    """An admin cannot touch a root or another admin. Root can touch anyone."""
    if _is_root(actor):
        return True
    target_role = target.user_role
    return target_role not in (UserRole.admin, UserRole.root)


def _can_assign(actor: User, requested_role: str) -> bool:
    """Only root can promote to admin/root."""
    if _is_root(actor):
        return True
    return requested_role not in ("admin", "root")


def _serialize(u: User) -> UserOut:
    return UserOut(
        id=str(u.id),
        email=u.email,
        name=u.name,
        surname=u.surname,
        username=u.username,
        phone=u.phone,
        avatar_url=u.avatar_url,
        role=_role_value(u),
        verified=bool(u.verified),
        blocked=bool(u.blocked),
        # The model doesn't currently store telegram_chat_id — this
        # keeps the API shape stable for the frontend even when the
        # column is absent. Remove if/when the column lands.
        telegram_chat_id=None,
        email_enabled=getattr(u, "notifications_email_enabled", True),
        telegram_enabled=getattr(u, "notifications_telegram_enabled", True),
        receives_order_notifications=getattr(
            u, "receives_order_notifications", False
        ),
        created_at=u.created_at.isoformat() if u.created_at else None,
    )


# ── Endpoints ────────────────────────────────────────────────────────

@router.get("", response_model=List[UserOut])
async def list_users(
    q: Optional[str] = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(User).order_by(User.created_at.desc())
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(like),
                User.name.ilike(like),
                User.surname.ilike(like),
                User.username.ilike(like),
                User.phone.ilike(like),
            )
        )
    return [_serialize(u) for u in query.limit(limit).all()]


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return _serialize(user)


@router.post("", response_model=UserOut, status_code=201)
async def create_user(
    payload: UserCreateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(_require_admin),
):
    if not _can_assign(actor, payload.role):
        raise HTTPException(403, "Only root can create admin or root users")

    email = payload.email.lower().strip()
    if db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(422, "Email already registered")

    user = User(
        email=email,
        password=hash_password(payload.password),
        name=payload.name,
        surname=payload.surname,
        phone=payload.phone,
        user_role=UserRole(payload.role),
        verified=payload.verified,
        blocked=payload.blocked,
    )
    db.add(user)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(422, f"Could not create user: {e}")
    db.refresh(user)
    return _serialize(user)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(_require_admin),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")

    if not _can_touch(actor, target):
        raise HTTPException(403, "Cannot modify this user")

    # Role guardrails
    if payload.role is not None and payload.role != _role_value(target):
        if not _can_assign(actor, payload.role):
            raise HTTPException(403, "Only root can change roles to admin or root")
        if target.id == actor.id:
            raise HTTPException(400, "Cannot change your own role")
        # Refuse to demote the last root out of existence.
        if _role_value(target) == "root" and payload.role != "root":
            root_count = (
                db.query(func.count(User.id))
                .filter(User.user_role == UserRole.root)
                .scalar()
                or 0
            )
            if root_count <= 1:
                raise HTTPException(400, "Cannot demote the last root user")

    if payload.email is not None:
        new_email = payload.email.lower().strip()
        existing = (
            db.query(User)
            .filter(func.lower(User.email) == new_email, User.id != target.id)
            .first()
        )
        if existing:
            raise HTTPException(422, "Email already registered")
        target.email = new_email

    if payload.password:
        target.password = hash_password(payload.password)

    for field in ("name", "surname", "phone", "avatar_url"):
        v = getattr(payload, field)
        if v is not None:
            setattr(target, field, v)

    if payload.role is not None:
        target.user_role = UserRole(payload.role)
    if payload.verified is not None:
        target.verified = payload.verified
    if payload.blocked is not None:
        target.blocked = payload.blocked

    # Notification preference toggles (only present on the model since
    # migration d8e9f0a1b2c3). Guarded with getattr to stay compatible
    # with older schemas.
    if payload.email_enabled is not None and hasattr(
        target, "notifications_email_enabled"
    ):
        target.notifications_email_enabled = payload.email_enabled
    if payload.telegram_enabled is not None and hasattr(
        target, "notifications_telegram_enabled"
    ):
        target.notifications_telegram_enabled = payload.telegram_enabled

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(422, f"Could not update user: {e}")
    db.refresh(target)
    return _serialize(target)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(_require_admin),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    if target.id == actor.id:
        raise HTTPException(400, "Cannot delete yourself")
    if not _can_touch(actor, target):
        raise HTTPException(403, "Cannot delete this user")

    if _role_value(target) == "root":
        root_count = (
            db.query(func.count(User.id))
            .filter(User.user_role == UserRole.root)
            .scalar()
            or 0
        )
        if root_count <= 1:
            raise HTTPException(400, "Cannot delete the last root user")

    db.delete(target)
    db.commit()
    return None
