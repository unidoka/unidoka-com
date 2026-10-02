"""
Password reset tokens — Redis-backed, TTL 30 min.

Tokens are UUIDs stored as `password_reset:{token} -> user_id`. The
token is consumed (deleted) on first use, so a link can't be replayed.

Redis over a DB table because:
  - tokens are ephemeral (auto-expire, no cleanup job)
  - the OTP flow already uses Redis for the same reason
  - no schema migration needed
"""
import json
import uuid
from datetime import datetime
from database.cache import cache_client

RESET_TTL_SECONDS = 30 * 60  # 30 minutes


def generate_reset_token() -> str:
    """Return a URL-safe opaque token."""
    return uuid.uuid4().hex + uuid.uuid4().hex[:8]


def save_reset_token(token: str, user_id: str) -> bool:
    key = f"password_reset:{token}"
    data = {"user_id": user_id, "created_at": datetime.utcnow().isoformat()}
    try:
        cache_client.setex(key, RESET_TTL_SECONDS, json.dumps(data))
        return True
    except Exception:
        return False


def consume_reset_token(token: str) -> str | None:
    """
    Look up the token and delete it in one shot. Returns the user_id or
    None if the token is missing / expired. Called exactly once per
    successful reset — a second call with the same token returns None.
    """
    key = f"password_reset:{token}"
    try:
        stored = cache_client.get(key)
        if not stored:
            return None
        data = json.loads(stored)
        cache_client.delete(key)
        return data.get("user_id")
    except Exception:
        return None
