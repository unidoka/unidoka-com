"""add api_keys table

Revision ID: e2a3b4c5d6e7
Revises: d0e1f2a3b4c5
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e2a3b4c5d6e7"
down_revision: Union[str, None] = "d0e1f2a3b4c5"
branch_labels = None
depends_on = None


def _has_table(conn, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def upgrade() -> None:
    conn = op.get_bind()
    if _has_table(conn, "api_keys"):
        return
    op.create_table(
        "api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("key_prefix", sa.String(20), nullable=False, index=True),
        sa.Column("key_hash", sa.String(64), nullable=False),
        sa.Column("key_encrypted", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False,
                  server_default=sa.true()),
        sa.Column("expires_at", sa.DateTime(), nullable=True, index=True),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    conn.execute(sa.text(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_api_keys_key_hash "
        "ON api_keys (key_hash)"
    ))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS api_keys CASCADE"))
