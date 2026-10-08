import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, JSON, text
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class Solution(Base):
    """
    A project / solution shown in the public /solutions section.
    Mirrors the shape of the static `Project` interface so existing
    frontend components (ProjectCard, etc.) can consume it directly.
    """
    __tablename__ = "solutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    short_description = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    mdx_content = Column(Text, nullable=True)

    cover_image_src = Column(String, nullable=True)
    cover_video_src = Column(String, nullable=True)
    href = Column(String, nullable=True)          # external Dprofile / case link
    platform = Column(String, nullable=True)

    category = Column(String, nullable=True)       # "e-commerce", "identity", etc.
    period = Column(String, nullable=True)         # "2024", "2025"
    tech_stack = Column(JSON, default=list, nullable=False, server_default=text("'[]'::jsonb"))
    tags = Column(JSON, default=list, nullable=False, server_default=text("'[]'::jsonb"))

    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)
    client_name = Column(String, nullable=True)   # fallback if no FK

    # Custom page override. If set and a component is registered in
    # `solution-custom-pages.tsx`, that component is rendered instead of
    # the MDX content. See app/solutions/[slug]/page.tsx.
    custom_page = Column(String, nullable=True)

    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)

    is_featured = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="draft", nullable=False, index=True)  # draft | published
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)
