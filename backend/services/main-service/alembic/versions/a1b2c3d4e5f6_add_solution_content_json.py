"""add solution content_json

Stores the Novel/Tiptap document alongside the legacy MDX body so the
admin editor survives a save and the public page can render rich blocks
(galleries, videos, columns).

Revision ID: a1b2c3d4e5f6
Revises: f3a4b5c6d7e8
Create Date: 2026-11-24
Idempotent: safe to re-run if a container restart interrupted the first attempt.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "f3a4b5c6d7e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    columns = {column["name"] for column in sa.inspect(conn).get_columns("solutions")}
    if "content_json" not in columns:
        op.add_column(
            "solutions",
            sa.Column("content_json", postgresql.JSONB, nullable=True),
        )


def downgrade() -> None:
    op.drop_column("solutions", "content_json")
