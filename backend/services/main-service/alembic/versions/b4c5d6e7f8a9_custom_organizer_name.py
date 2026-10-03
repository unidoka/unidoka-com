"""events.custom_organizer_name — free-text fallback when the user's
organizer isn't in the taxonomy yet."""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "b4c5d6e7f8a9"
down_revision: Union[str, None] = "a3b4c5d6e7f8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "events", "custom_organizer_name"):
        op.add_column(
            "events",
            sa.Column("custom_organizer_name", sa.String(), nullable=True),
        )


def downgrade() -> None:
    conn = op.get_bind()
    if _has_column(conn, "events", "custom_organizer_name"):
        conn.execute(sa.text("ALTER TABLE events DROP COLUMN custom_organizer_name"))
