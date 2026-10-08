"""add solutions table
Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-10-08
Idempotent: safe to re-run if a container restart interrupted the
first attempt.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(conn, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def upgrade() -> None:
    conn = op.get_bind()
    if _has_table(conn, "solutions"):
        return
    op.create_table(
        "solutions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("short_description", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("mdx_content", sa.Text(), nullable=True),
        sa.Column("cover_image_src", sa.String(), nullable=True),
        sa.Column("cover_video_src", sa.String(), nullable=True),
        sa.Column("href", sa.String(), nullable=True),
        sa.Column("platform", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("period", sa.String(), nullable=True),
        sa.Column("tech_stack", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("tags", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=True),
        sa.Column("client_name", sa.String(), nullable=True),
        sa.Column("custom_page", sa.String(), nullable=True),
        sa.Column("seo_title", sa.String(), nullable=True),
        sa.Column("meta_description", sa.String(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    conn.execute(sa.text("CREATE UNIQUE INDEX IF NOT EXISTS ix_solutions_slug ON solutions (slug)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_solutions_status ON solutions (status)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_solutions_deleted_at ON solutions (deleted_at)"))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS solutions CASCADE"))
