import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class ApiKey(Base):
    """An admin-issued credential that authenticates as its owning user.

    Keys are stored twice on purpose:

      * `key_hash`      — SHA-256 hex digest, indexed UNIQUE, used for
                          O(1) auth lookup. Never reversible.
      * `key_encrypted` — Fernet ciphertext of the raw key. Used only by
                          the owner-or-root reveal endpoint. Gives back
                          the "show me my key" affordance without
                          weakening the auth path (which never touches
                          the ciphertext).

    `key_prefix` is the first 12 chars of the raw key (e.g.
    ``ud_live_abc1``) and is what the UI shows in lists. It is NOT
    unique — two keys can share a prefix. Uniqueness lives on
    `key_hash`.
    """

    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    key_prefix = Column(String(20), nullable=False, index=True)
    key_hash = Column(String(64), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True, index=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
