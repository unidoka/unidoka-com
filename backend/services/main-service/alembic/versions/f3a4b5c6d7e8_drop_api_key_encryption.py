"""drop api_keys.key_encrypted

Revision ID: f3a4b5c6d7e8
Revises: e2a3b4c5d6e7

Storing the API key encrypted allowed the server to decrypt and
reveal it later. The correct security model is to show the key once
at creation and store only a one-way SHA-256 hash. This migration
drops the now-unused column.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "f3a4b5c6d7e8"
down_revision: Union[str, None] = "e2a3b4c5d6e7"
branch_labels = None
depends_on = None


def _has_column(conn, table: str, column: str) -> bool:
    insp = sa.inspect(conn)
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()
    if _has_column(conn, "api_keys", "key_encrypted"):
        op.drop_column("api_keys", "key_encrypted")


def downgrade() -> None:
    conn = op.get_bind()
    if not _has_column(conn, "api_keys", "key_encrypted"):
        op.add_column("api_keys", sa.Column("key_encrypted", sa.Text(), nullable=True))
