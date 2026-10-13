"""add actions to marketing_placements

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-10-13

Replaces the single cta_label/cta_url pair with a JSONB array of action
objects: [{label, url, variant}]. Placements start with zero buttons
and the admin adds them explicitly — the old single-button shape
implied "always has a CTA", which was wrong for informational strips.

The legacy cta_label / cta_url columns are left in place (nullable, not
read by new code) so any existing rows can be migrated lazily without a
data-backfill step.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "b8c9d0e1f2a3"
down_revision: Union[str, None] = "a7b8c9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    if not sa.inspect(conn).has_table(table):
        return False
    return any(c["name"] == column for c in sa.inspect(conn).get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "marketing_placements", "actions"):
        op.add_column(
            "marketing_placements",
            sa.Column(
                "actions",
                postgresql.JSONB,
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            ),
        )


def downgrade() -> None:
    conn = op.get_bind()
    if _has_column(conn, "marketing_placements", "actions"):
        conn.execute(
            sa.text("ALTER TABLE marketing_placements DROP COLUMN actions")
        )
