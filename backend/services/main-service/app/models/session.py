import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class UserSession(Base):
    """Tracks active logins (devices) for a user."""
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    device_id = Column(String, nullable=False, index=True)
    user_agent = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    
    # We don't store the raw refresh token, just a hash of it
    refresh_token_hash = Column(String, nullable=False)
    
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
