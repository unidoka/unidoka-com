"""notification topics + order-notification recipients

Revision ID: e1f2a3b4c5d6
Revises: d8e9f0a1b2c3
Create Date: 2026-10-03

Adds two columns to `users`:

  notification_topics            JSONB, default '[]'
      Which content categories the user subscribes to. "events" and
      "vershiny" are the only allowed values. Order notifications are
      NOT subscribable here — recipients are picked by root (see
      receives_order_notifications).

  receives_order_notifications   Boolean, default false
      True for users who should receive "new order" emails when a
      customer submits a consultation / order request. Root-only
      editable via PUT /api/v1/admin/users/{id}/order-notifications.

Legal / policy / account mail is always sent — it is transactional,
not a subscription, and is intentionally NOT toggleable in this schema.

IDEMPOTENT: safe to re-run. Every ALTER is guarded by a column-exists
check so a partially-applied migration (container restart mid-run)
does not crash on the second attempt.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "d8e9f0a1b2c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "users", "notification_topics"):
        op.add_column(
            "users",
            sa.Column(
                "notification_topics",
                postgresql.JSONB,
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            ),
        )
    if not _has_column(conn, "users", "receives_order_notifications"):
        op.add_column(
            "users",
            sa.Column(
                "receives_order_notifications",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )


def downgrade() -> None:
    for col in ("receives_order_notifications", "notification_topics"):
        op.execute(sa.text(f"ALTER TABLE users DROP COLUMN IF EXISTS {col}"))
