"""
User notification preferences.

Two layers:

  1. Channel toggles — `email_enabled` / `telegram_enabled`.
     Whether the user wants to receive notifications by that channel
     at all. Legal / policy / account mail is NOT gated by these — it
     is transactional and always sent.

  2. Topic subscriptions — `topics: string[]`.
     Which content categories the user subscribes to. Currently:
       events    — forum / hackathon / meetup announcements
       vershiny  — Vershiny program updates
     Order notifications are intentionally excluded — recipients are
     selected by root via PUT /admin/users/{id}/order-notifications.

Telegram linking (OAuth-style binding of a chat_id to the account) is
not implemented. The endpoint reports `telegram_connected: false` and
the connect/disconnect routes return 501. The frontend already handles
that state gracefully.
"""
import os

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.user import User
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/me/notifications", tags=["notifications"])

# Only these topics are user-subscribable. Extending this set requires
# a matching entry in the frontend settings page.
ALLOWED_TOPICS = frozenset({"events", "vershiny"})


class NotificationPrefs(BaseModel):
    email_enabled: bool
    telegram_enabled: bool
    telegram_connected: bool
    telegram_username: str | None
    bot_username: str | None
    topics: list[str]
    # Read-only informational flags so the UI can render the "always
    # on" note without hard-coding copy.
    transactional_email: bool = True


class NotificationPrefsUpdate(BaseModel):
    email_enabled: bool | None = None
    telegram_enabled: bool | None = None
    topics: list[str] | None = None


def _normalize_topics(raw) -> list[str]:
    """Filter stored topics to the current allowlist.

    If the allowlist shrinks in a future release, stale topics in the
    DB are silently dropped from the response rather than surfaced as
    unknown keys.
    """
    if not isinstance(raw, list):
        return []
    return [t for t in raw if isinstance(t, str) and t in ALLOWED_TOPICS]


def _serialize(user: User) -> NotificationPrefs:
    return NotificationPrefs(
        email_enabled=user.notifications_email_enabled,
        telegram_enabled=user.notifications_telegram_enabled,
        telegram_connected=False,
        telegram_username=user.telegram_username,
        bot_username=os.getenv("TELEGRAM_BOT_USERNAME"),
        topics=_normalize_topics(user.notification_topics or []),
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
    if payload.topics is not None:
        # Whitelist at write time too — never persist an unknown topic.
        current_user.notification_topics = _normalize_topics(payload.topics)
    db.commit()
    db.refresh(current_user)
    return _serialize(current_user)


@router.post("/telegram/connect-code")
async def create_telegram_code(_: User = Depends(get_current_user)):
    from fastapi import HTTPException
    raise HTTPException(501, "Telegram linking not implemented yet")


@router.delete("/telegram")
async def disconnect_telegram(_: User = Depends(get_current_user)):
    from fastapi import HTTPException
    raise HTTPException(501, "Telegram linking not implemented yet")
