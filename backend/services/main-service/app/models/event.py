import uuid
from datetime import datetime
import enum
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Text, Integer,
    ForeignKey, Table,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class EventStatus(str, enum.Enum):
    """Moderation state for a submitted event."""
    pending = "pending"     # user submitted, awaiting admin review
    approved = "approved"   # live on the public calendar
    rejected = "rejected"   # declined by admin


# ── Taxonomy tables ──────────────────────────────────────────────────────
class Organizer(Base):
    """A company or community that runs events (Росмолодёжь, Росконгресс, …)."""
    __tablename__ = "organizers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    color = Column(String, nullable=True)     # hex accent used across the UI
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


class EventType(Base):
    """Broad category (IT, Business, Design, …). Admin-only creation."""
    __tablename__ = "event_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True)
    icon = Column(String, nullable=True)        # phosphor icon name
    color = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


class EventDirection(Base):
    """Vershiny top-level direction (Software, Design, Business, Hardware)."""
    __tablename__ = "event_directions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True)
    emoji = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    subdirections = relationship(
        "EventSubdirection",
        back_populates="direction",
        order_by="EventSubdirection.sort_order",
    )


class EventSubdirection(Base):
    """Sub-direction under a Vershiny direction. These are the event tags."""
    __tablename__ = "event_subdirections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    direction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("event_directions.id"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    direction = relationship("EventDirection", back_populates="subdirections")


# ── Association tables ───────────────────────────────────────────────────
event_subdirection_link = Table(
    "event_subdirection_assignments",
    Base.metadata,
    Column(
        "event_id", UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "subdirection_id", UUID(as_uuid=True),
        ForeignKey("event_subdirections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ── Events ───────────────────────────────────────────────────────────────
class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    short_description = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    cover_image_src = Column(String, nullable=True)
    cover_video_src = Column(String, nullable=True)
    href = Column(String, nullable=True)

    start_at = Column(DateTime, nullable=True)
    end_at = Column(DateTime, nullable=True)

    location_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    metro = Column(String, nullable=True)
    city = Column(String, nullable=True)
    price = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    registration_url = Column(String, nullable=True)

    organizer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizers.id"),
        nullable=True,
    )

    # ── Moderation ─────────────────────────────────────────────────────
    status = Column(
        Enum(EventStatus, name="event_status"),
        default=EventStatus.pending,
        nullable=False,
        index=True,
    )
    rejection_reason = Column(Text, nullable=True)
    submitted_by_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True,
    )
    reviewed_by_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True,
    )
    reviewed_at = Column(DateTime, nullable=True)

    # ── Presentation ──────────────────────────────────────────────────
    custom_page = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    mdx_content = Column(Text, nullable=True)

    # ── Timestamps / soft delete ───────────────────────────────────────
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)

    # ── Relationships ──────────────────────────────────────────────────
    organizer = relationship("Organizer", lazy="joined")
    submitted_by = relationship("User", foreign_keys=[submitted_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    subdirections = relationship(
        "EventSubdirection",
        secondary=event_subdirection_link,
        lazy="selectin",
    )
    type_assignments = relationship(
        "EventTypeAssignment",
        back_populates="event",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class EventTypeAssignment(Base):
    """
    A type assigned to an event.

    If `type_id` is set → the event is tagged with an existing type.
    If `type_id` is NULL and `custom_name` is set → the submitter proposed
    a type that doesn't exist yet. Admin can promote it later by creating
    the row and re-pointing this assignment.
    """
    __tablename__ = "event_type_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
    )
    type_id = Column(
        UUID(as_uuid=True),
        ForeignKey("event_types.id"),
        nullable=True,
    )
    custom_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="type_assignments")
    type = relationship("EventType", lazy="joined")
