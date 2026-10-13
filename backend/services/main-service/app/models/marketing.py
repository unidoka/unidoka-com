import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Text, Enum, text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from database.database import Base


class MarketingPlacement(Base):
    """A scheduled, page-targeted UI placement.

    Renamed away from "banner" on purpose — ad blockers filter DOM
    nodes and URLs matching that pattern, and the public renderer
    lives on the same host as the rest of the site.

    `page` uses route-prefix matching (`events` covers /events and
    every nested route below it) plus the reserved value `global` for
    "show on every page". Adding a new page requires zero schema
    change — mount `<PlacementSlot page="…" />` where you want it.

    `start_at` / `end_at` bound the campaign window. Both nullable:
    a null start means "run from creation", a null end means "run
    indefinitely". The public query filters on `now()` inside that
    window AND on `is_active`.
    """
    __tablename__ = "marketing_placements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, nullable=False, unique=True, index=True)

    # Internal label. Not shown to end users.
    title = Column(String, nullable=False)

    # Where it renders. Values match the placement_type enum used by
    # the public <PlacementSlot type="…" /> mount point.
    placement_type = Column(
        Enum(
            "top", "card", "toast", "dialog",
            name="marketing_placement_type",
        ),
        nullable=False,
        index=True,
    )

    # Page targeting. `global` matches every route.
    page = Column(String, nullable=False, default="global", index=True)

    # ── Content ────────────────────────────────────────────────────
    heading = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    # Array of {label, url, variant} objects. Empty by default — a
    # placement is text-only until the admin adds a button. Variants
    # are rendered by the public slot: primary | outlined | text.
    actions = Column(
        JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb")
    )
    # Legacy single-button columns, kept nullable for pre-actions rows.
    # New code writes to `actions` only.
    cta_label = Column(String, nullable=True)
    cta_url = Column(String, nullable=True)
    accent_color = Column(String, nullable=True)  # optional hex accent

    # ── Scheduling ─────────────────────────────────────────────────
    start_at = Column(DateTime, nullable=True, index=True)
    end_at = Column(DateTime, nullable=True, index=True)

    # ── Lifecycle ──────────────────────────────────────────────────
    # Soft on/off toggle, orthogonal to the schedule window. An
    # inactive placement stays in the DB but the public query skips it.
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    # Higher wins when the same slot has more than one match.
    priority = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    deleted_at = Column(DateTime, nullable=True, index=True)
