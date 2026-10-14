"""add permissions to users

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-10-13

Adds a JSONB `permissions` column to users and backfills every
existing `admin` with the full permission set.

The backfill preserves current behaviour on upgrade: before this
migration, an `admin` had implicit access to every admin page. An
empty default would silently strip that access and lock out every
non-root admin until someone re-granted each permission by hand.
Granting everything is the safe upgrade path — root can trim.

New admins created via the panel default to an empty permission set
(the create/update payload's default), so access is grant-only from
here on.

Idempotent — the ADD COLUMN is guarded, and the UPDATE is a no-op on
a second run.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c9d0e1f2a3b4"
down_revision: Union[str, None] = "b8c9d0e1f2a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Snapshot of ADMIN_PERMISSIONS at migration time. Migrations must not
# import application code — a future refactor that renames a permission
# would change history. If the set grows later, this list stays frozen
# and the new permissions are opt-in via the panel.
FULL_ADMIN_SET = [
    "admin.dashboard",
    "admin.users",
    "admin.orders",
    "admin.solutions",
    "admin.articles",
    "admin.events",
    "admin.catalog",
    "admin.vershiny",
    "admin.marketing",
]


def _has_column(conn, table: str, column: str) -> bool:
    if not sa.inspect(conn).has_table(table):
        return False
    return any(c["name"] == column for c in sa.inspect(conn).get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "users", "permissions"):
        op.add_column(
            "users",
            sa.Column(
                "permissions",
                postgresql.JSONB,
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            ),
        )

    # Backfill: give every existing admin the full set so their access
    # is unchanged across the upgrade. Root is deliberately skipped —
    # root doesn't consult `permissions`, and writing a set onto root
    # rows would be misleading the next time someone reads one.
    import json
    conn.execute(
        sa.text(
            "UPDATE users SET permissions = CAST(:perms AS jsonb) "
            "WHERE user_role = 'admin'"
        ),
        {"perms": json.dumps(FULL_ADMIN_SET)},
    )


def downgrade() -> None:
    conn = op.get_bind()
    if _has_column(conn, "users", "permissions"):
        conn.execute(sa.text("ALTER TABLE users DROP COLUMN permissions"))
