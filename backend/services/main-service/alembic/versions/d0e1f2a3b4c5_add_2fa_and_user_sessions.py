"""add 2FA fields + user_sessions table

Revision ID: d0e1f2a3b4c5
Revises: c9d0e1f2a3b4
Create Date: 2026-10-29

Reconciles two model-vs-migration drifts that had no migration of
their own:

  * users.two_factor_secret / users.two_factor_enabled
      Declared on app.models.user.User, but no prior migration ever
      created them. Every SELECT touching User raised
      "ProgrammingError: column users.two_factor_secret does not
      exist".

  * user_sessions table
      Declared on app.models.session.UserSession (device/session
      tracking used by /login/email and /me/sessions), but no prior
      migration ever created it. Would have failed on the first
      login.

Idempotent: every ADD and CREATE is guarded, so a partial run, or a
re-run against an already-migrated DB, is a no-op.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d0e1f2a3b4c5"
down_revision: Union[str, None] = "c9d0e1f2a3b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(conn, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()

    # ── users: 2FA (TOTP) columns ─────────────────────────────────
    if not _has_column(conn, "users", "two_factor_secret"):
        op.add_column(
            "users",
            sa.Column("two_factor_secret", sa.String(), nullable=True),
        )
    if not _has_column(conn, "users", "two_factor_enabled"):
        op.add_column(
            "users",
            sa.Column(
                "two_factor_enabled",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    # ── user_sessions: device/session tracking ────────────────────
    if not _has_table(conn, "user_sessions"):
        op.create_table(
            "user_sessions",
            sa.Column(
                "id",
                postgresql.UUID(as_uuid=True),
                primary_key=True,
            ),
            sa.Column(
                "user_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column(
                "device_id",
                sa.String(),
                nullable=False,
                index=True,
            ),
            sa.Column("user_agent", sa.String(), nullable=True),
            sa.Column("ip_address", sa.String(), nullable=True),
            # We never store the raw refresh token - only its hash.
            sa.Column("refresh_token_hash", sa.String(), nullable=False),
            sa.Column(
                "is_revoked",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                server_default=sa.func.now(),
            ),
            sa.Column(
                "last_used_at",
                sa.DateTime(),
                server_default=sa.func.now(),
            ),
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS user_sessions CASCADE"))
    for col in ("two_factor_enabled", "two_factor_secret"):
        if _has_column(conn, "users", col):
            conn.execute(sa.text(f"ALTER TABLE users DROP COLUMN {col}"))
