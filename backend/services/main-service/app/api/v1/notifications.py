"""
User notification preferences.

Reads/writes two boolean flags on the user record. Telegram *linking*
(the OAuth-style flow that binds a chat_id to the account) is not
implemented — the endpoint reports `telegram_connected: false` and the
connect/disconnect routes return 501. The frontend already handles that
state gracefully ("Telegram не подключён" + a disabled connect button).
"""
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.user import User
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/me/notifications", tags=["notifications"])


class NotificationPrefs(BaseModel):
    email_enabled: bool
    telegram_enabled: bool
    telegram_connected: bool
    telegram_username: str | None
    bot_username: str | None


class NotificationPrefsUpdate(BaseModel):
    email_enabled: bool | None = None
    telegram_enabled: bool | None = None


def _serialize(user: User) -> NotificationPrefs:
    return NotificationPrefs(
        email_enabled=user.notifications_email_enabled,
        telegram_enabled=user.notifications_telegram_enabled,
        telegram_connected=False,
        telegram_username=user.telegram_username,
        bot_username=os.getenv("TELEGRAM_BOT_USERNAME"),
    )


@router.get("", response_model=NotificationPrefs)
async def get_prefs(current_user: User = Depends(get_current_user)):
    return _serialize(current_user)


@router.put("", response_model=NotificationPrefs)
async def update_prefs(
    payload: NotificationPrefsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email_enabled is not None:
        current_user.notifications_email_enabled = payload.email_enabled
    if payload.telegram_enabled is not None:
        current_user.notifications_telegram_enabled = payload.telegram_enabled
    db.commit()
    db.refresh(current_user)
    return _serialize(current_user)


@router.post("/telegram/connect-code")
async def create_telegram_code(_: User = Depends(get_current_user)):
    raise HTTPException(501, "Telegram linking not implemented yet")


@router.delete("/telegram")
async def disconnect_telegram(_: User = Depends(get_current_user)):
    raise HTTPException(501, "Telegram linking not implemented yet")
