"""
Root-only toggle for the order-notification recipient list.

Deliberately a separate endpoint from the main PATCH /admin/users/{id}:

  - The main endpoint is used by regular admins for role/verified/blocked
    edits. Keeping this out of that payload makes the root-only
    restriction obvious in the URL space — a regular admin cannot even
    guess a route that would grant them order mail.

  - The frontend admin editor can save everything else with its existing
    PATCH call, and PUT this one field separately only when root changed
    it. No changes to the existing admin user update handler.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


class OrderNotificationsPayload(BaseModel):
    enabled: bool


def _require_root(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role != UserRole.root:
        raise HTTPException(403, "Root role required")
    return current_user


@router.put("/{user_id}/order-notifications")
async def set_order_notifications(
    user_id: uuid.UUID,
    payload: OrderNotificationsPayload,
    db: Session = Depends(get_db),
    _: User = Depends(_require_root),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    target.receives_order_notifications = bool(payload.enabled)
    db.commit()
    db.refresh(target)
    return {
        "id": str(target.id),
        "receives_order_notifications": target.receives_order_notifications,
    }
