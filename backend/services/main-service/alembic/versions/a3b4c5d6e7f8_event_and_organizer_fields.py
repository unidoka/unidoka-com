"""event timestamps, cover upload, split content + organizer avatar/owner

Revision ID: a3b4c5d6e7f8
Revises: f2a3b4c5d6e7
Create Date: 2026-10-04

Adds:
  events.registration_deadline     DateTime, nullable
  events.other_dates               JSONB,    default '[]'
  organizers.avatar_url            String,   nullable
  organizers.owner_id              UUID FK users.id, nullable

Idempotent — every ADD is guarded by a column-exists check.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a3b4c5d6e7f8"
down_revision: Union[str, None] = "f2a3b4c5d6e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()

    if not _has_column(conn, "events", "registration_deadline"):
        op.add_column(
            "events",
            sa.Column("registration_deadline", sa.DateTime(), nullable=True),
        )

    if not _has_column(conn, "events", "other_dates"):
        op.add_column(
            "events",
            sa.Column(
                "other_dates",
                postgresql.JSONB,
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            ),
        )

    if not _has_column(conn, "organizers", "avatar_url"):
        op.add_column(
            "organizers",
            sa.Column("avatar_url", sa.String(), nullable=True),
        )

    if not _has_column(conn, "organizers", "owner_id"):
        op.add_column(
            "organizers",
            sa.Column(
                "owner_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("users.id"),
                nullable=True,
            ),
        )


def downgrade() -> None:
    conn = op.get_bind()
    for table, col in [
        ("organizers", "owner_id"),
        ("organizers", "avatar_url"),
        ("events", "other_dates"),
        ("events", "registration_deadline"),
    ]:
        if _has_column(conn, table, col):
            conn.execute(sa.text(f"ALTER TABLE {table} DROP COLUMN {col}"))
