import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Text, JSON, text,
)
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class Article(Base):
    """A journal post published under /blog."""
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content_json = Column(JSON, nullable=True)

    cover_image_src = Column(String, nullable=True)
    cover_video_src = Column(String, nullable=True)

    category = Column(String, nullable=True)
    tags = Column(JSON, default=list, nullable=False, server_default=text("'[]'::jsonb"))

    author_name = Column(String, nullable=True)
    author_avatar_url = Column(String, nullable=True)
    is_team_author = Column(Boolean, default=True, nullable=False)

    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)

    is_featured = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="draft", nullable=False, index=True)  # draft | published | archived
    sort_order = Column(Integer, default=0)

    published_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)
