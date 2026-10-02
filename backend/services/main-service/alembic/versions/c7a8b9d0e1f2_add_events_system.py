"""add events system

Revision ID: c7a8b9d0e1f2
Revises: b1c2d3e4f5a6
Create Date: 2026-10-05 00:00:00

Introduces the events subsystem:
  - organizers, event_types, event_directions, event_subdirections
  - events, event_type_assignments, event_subdirection_assignments
  - event_status enum (pending / approved / rejected)

Every new table has a nullable `deleted_at` for soft deletion. Baseline
taxonomies (Vershiny directions + subdirections) are seeded by
`backend/seed_events.sql` — this migration is schema-only.

Idempotency: the enum is created inside a DO block that swallows
`duplicate_object`, and the `status` column uses
`postgresql.ENUM(..., create_type=False)` so SQLAlchemy does not try to
CREATE TYPE a second time.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c7a8b9d0e1f2"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # ── Enums ────────────────────────────────────────────────────────
    # DO block: creates the type if absent, otherwise no-ops. This is
    # the standard Postgres idiom for "CREATE TYPE IF NOT EXISTS".
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    # ── organizers ───────────────────────────────────────────────────
    op.create_table(
        "organizers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_organizers_id", "organizers", ["id"])
    op.create_index("ix_organizers_name", "organizers", ["name"], unique=True)
    op.create_index("ix_organizers_slug", "organizers", ["slug"], unique=True)
    op.create_index("ix_organizers_deleted_at", "organizers", ["deleted_at"])

    # ── event_types ──────────────────────────────────────────────────
    op.create_table(
        "event_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("icon", sa.String(), nullable=True),
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_event_types_id", "event_types", ["id"])
    op.create_index("ix_event_types_name", "event_types", ["name"], unique=True)
    op.create_index("ix_event_types_slug", "event_types", ["slug"], unique=True)
    op.create_index("ix_event_types_deleted_at", "event_types", ["deleted_at"])

    # ── event_directions ─────────────────────────────────────────────
    op.create_table(
        "event_directions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("emoji", sa.String(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_event_directions_id", "event_directions", ["id"])
    op.create_index("ix_event_directions_name", "event_directions", ["name"], unique=True)
    op.create_index("ix_event_directions_slug", "event_directions", ["slug"], unique=True)
    op.create_index("ix_event_directions_deleted_at", "event_directions", ["deleted_at"])

    # ── event_subdirections ──────────────────────────────────────────
    op.create_table(
        "event_subdirections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("direction_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("event_directions.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_event_subdirections_id", "event_subdirections", ["id"])
    op.create_index("ix_event_subdirections_slug", "event_subdirections", ["slug"], unique=True)
    op.create_index("ix_event_subdirections_direction_id",
                    "event_subdirections", ["direction_id"])
    op.create_index("ix_event_subdirections_deleted_at",
                    "event_subdirections", ["deleted_at"])

    # ── events ───────────────────────────────────────────────────────
    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("short_description", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cover_image_src", sa.String(), nullable=True),
        sa.Column("cover_video_src", sa.String(), nullable=True),
        sa.Column("href", sa.String(), nullable=True),
        sa.Column("start_at", sa.DateTime(), nullable=True),
        sa.Column("end_at", sa.DateTime(), nullable=True),
        sa.Column("location_name", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("metro", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("price", sa.String(), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("registration_url", sa.String(), nullable=True),
        sa.Column("organizer_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("organizers.id"), nullable=True),
        # create_type=False — the enum was created manually above. Without
        # this flag, SQLAlchemy tries to CREATE TYPE again and crashes.
        sa.Column("status",
                  postgresql.ENUM(
                      "pending", "approved", "rejected",
                      name="event_status",
                      create_type=False,
                  ),
                  nullable=False, server_default="pending"),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("submitted_by_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id"), nullable=True),
        sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("custom_page", sa.String(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("seo_title", sa.String(), nullable=True),
        sa.Column("meta_description", sa.String(), nullable=True),
        sa.Column("mdx_content", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_events_id", "events", ["id"])
    op.create_index("ix_events_slug", "events", ["slug"], unique=True)
    op.create_index("ix_events_status", "events", ["status"])
    op.create_index("ix_events_start_at", "events", ["start_at"])
    op.create_index("ix_events_deleted_at", "events", ["deleted_at"])

    # ── event_type_assignments ───────────────────────────────────────
    op.create_table(
        "event_type_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("event_types.id"), nullable=True),
        sa.Column("custom_name", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_eta_event_id", "event_type_assignments", ["event_id"])
    op.create_index("ix_eta_type_id", "event_type_assignments", ["type_id"])

    # ── event_subdirection_assignments ───────────────────────────────
    op.create_table(
        "event_subdirection_assignments",
        sa.Column("event_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("subdirection_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("event_subdirections.id", ondelete="CASCADE"),
                  primary_key=True),
    )


def downgrade() -> None:
    op.drop_table("event_subdirection_assignments")
    op.drop_table("event_type_assignments")
    op.drop_index("ix_events_deleted_at", table_name="events")
    op.drop_index("ix_events_start_at", table_name="events")
    op.drop_index("ix_events_status", table_name="events")
    op.drop_index("ix_events_slug", table_name="events")
    op.drop_index("ix_events_id", table_name="events")
    op.drop_table("events")
    op.drop_index("ix_event_subdirections_deleted_at", table_name="event_subdirections")
    op.drop_index("ix_event_subdirections_direction_id", table_name="event_subdirections")
    op.drop_index("ix_event_subdirections_slug", table_name="event_subdirections")
    op.drop_index("ix_event_subdirections_id", table_name="event_subdirections")
    op.drop_table("event_subdirections")
    op.drop_index("ix_event_directions_deleted_at", table_name="event_directions")
    op.drop_index("ix_event_directions_slug", table_name="event_directions")
    op.drop_index("ix_event_directions_name", table_name="event_directions")
    op.drop_index("ix_event_directions_id", table_name="event_directions")
    op.drop_table("event_directions")
    op.drop_index("ix_event_types_deleted_at", table_name="event_types")
    op.drop_index("ix_event_types_slug", table_name="event_types")
    op.drop_index("ix_event_types_name", table_name="event_types")
    op.drop_index("ix_event_types_id", table_name="event_types")
    op.drop_table("event_types")
    op.drop_index("ix_organizers_deleted_at", table_name="organizers")
    op.drop_index("ix_organizers_slug", table_name="organizers")
    op.drop_index("ix_organizers_name", table_name="organizers")
    op.drop_index("ix_organizers_id", table_name="organizers")
    op.drop_table("organizers")
    op.execute("DROP TYPE IF EXISTS event_status")
