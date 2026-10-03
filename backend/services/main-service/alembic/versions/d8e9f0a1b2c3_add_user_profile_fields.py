"""add user profile fields (telegram, github, notification prefs)

Revision ID: d8e9f0a1b2c3
Revises: c7a8b9d0e1f2
Create Date: 2026-10-03

Extends `users` with:
  - telegram_username       — public handle, unique, nullable
  - github_url              — profile link, nullable
  - notifications_email_enabled     — user-level toggle, default true
  - notifications_telegram_enabled  — user-level toggle, default true

All adds are nullable or have a server_default so they're safe on a
live table without a rewrite.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "d8e9f0a1b2c3"
down_revision: Union[str, None] = "c7a8b9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "users", "telegram_username"):
        op.add_column("users", sa.Column("telegram_username", sa.String(), nullable=True))
        conn.execute(sa.text(
            "CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_username_key "
            "ON users (telegram_username) WHERE telegram_username IS NOT NULL"
        ))
    if not _has_column(conn, "users", "github_url"):
        op.add_column("users", sa.Column("github_url", sa.String(), nullable=True))
    if not _has_column(conn, "users", "notifications_email_enabled"):
        op.add_column("users", sa.Column(
            "notifications_email_enabled", sa.Boolean(),
            nullable=False, server_default=sa.true(),
        ))
    if not _has_column(conn, "users", "notifications_telegram_enabled"):
        op.add_column("users", sa.Column(
            "notifications_telegram_enabled", sa.Boolean(),
            nullable=False, server_default=sa.true(),
        ))


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS users_telegram_username_key")
    for col in (
        "notifications_telegram_enabled",
        "notifications_email_enabled",
        "github_url",
        "telegram_username",
    ):
        op.execute(sa.text(f"ALTER TABLE users DROP COLUMN IF EXISTS {col}"))
