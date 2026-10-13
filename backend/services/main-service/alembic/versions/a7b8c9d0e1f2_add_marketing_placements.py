"""add marketing_placements

Revision ID: a7b8c9d0e1f2
Revises: d4e5f6a7b8c9
Create Date: 2026-10-13

Introduces the marketing placement system. A placement is a scheduled,
page-targeted UI slot — a strip, inline card, toast, or modal — that
renders on routes matching its `page` value. Multiple placements can
be active for the same slot at once; the public query returns them all
and the frontend stacks them by priority.

Idempotent: every CREATE is guarded by an existence check so a
container restart mid-migration does not produce DuplicateTable.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(conn, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def upgrade() -> None:
    conn = op.get_bind()

    # Enum — created explicitly (with a DO block) so a re-run after a
    # mid-migration restart does not fail on duplicate_object.
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE marketing_placement_type AS ENUM
                ('top', 'card', 'toast', 'dialog');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    if not _has_table(conn, "marketing_placements"):
        op.create_table(
            "marketing_placements",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column(
                "placement_type",
                postgresql.ENUM(
                    "top", "card", "toast", "dialog",
                    name="marketing_placement_type",
                    create_type=False,
                ),
                nullable=False,
            ),
            sa.Column("page", sa.String(), nullable=False, server_default="global"),
            sa.Column("heading", sa.String(), nullable=True),
            sa.Column("body", sa.Text(), nullable=True),
            sa.Column("image_url", sa.String(), nullable=True),
            sa.Column("cta_label", sa.String(), nullable=True),
            sa.Column("cta_url", sa.String(), nullable=True),
            sa.Column("accent_color", sa.String(), nullable=True),
            sa.Column("start_at", sa.DateTime(), nullable=True),
            sa.Column("end_at", sa.DateTime(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
        )

    # Indexes are created separately so re-runs of the block above
    # (against a table that already exists) still get any index that
    # a partial previous run may have missed.
    conn.execute(sa.text(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_marketing_placements_slug "
        "ON marketing_placements (slug)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_marketing_placements_page "
        "ON marketing_placements (page)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_marketing_placements_type "
        "ON marketing_placements (placement_type)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_marketing_placements_active "
        "ON marketing_placements (is_active)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_marketing_placements_window "
        "ON marketing_placements (start_at, end_at)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_marketing_placements_deleted "
        "ON marketing_placements (deleted_at)"
    ))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS marketing_placements CASCADE"))
    conn.execute(sa.text("DROP TYPE IF EXISTS marketing_placement_type"))
