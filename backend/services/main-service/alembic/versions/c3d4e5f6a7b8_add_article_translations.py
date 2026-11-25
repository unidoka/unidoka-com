"""add article language and translation groups

Each article row is one language version. Rows that translate each other
share `translation_group_id`; `(translation_group_id, lang)` is unique so a
group can hold at most one version per language.

Revision ID: c3d4e5f6a7b8
Revises: b1c2d3e4f5a7
Create Date: 2026-11-24
Idempotent: safe to re-run if a container restart interrupted the first attempt.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b1c2d3e4f5a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(conn) -> set[str]:
    return {column["name"] for column in sa.inspect(conn).get_columns("articles")}


def upgrade() -> None:
    conn = op.get_bind()
    columns = _columns(conn)

    if "lang" not in columns:
        op.add_column(
            "articles",
            sa.Column("lang", sa.String(), nullable=False, server_default="ru"),
        )

    if "translation_group_id" not in columns:
        op.add_column(
            "articles",
            sa.Column("translation_group_id", postgresql.UUID(as_uuid=True), nullable=True),
        )

    # Every existing article becomes its own group. Safe to repeat: a crashed
    # first attempt may have added the column before the backfill ran.
    conn.execute(
        sa.text(
            "UPDATE articles SET translation_group_id = id "
            "WHERE translation_group_id IS NULL"
        )
    )
    group_column = next(
        column
        for column in sa.inspect(conn).get_columns("articles")
        if column["name"] == "translation_group_id"
    )
    if group_column["nullable"]:
        op.alter_column("articles", "translation_group_id", nullable=False)

    op.execute("CREATE INDEX IF NOT EXISTS ix_articles_lang ON articles (lang)")
    # Partial so a soft-deleted version does not block re-creating that language.
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_articles_group_lang "
        "ON articles (translation_group_id, lang) WHERE deleted_at IS NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_articles_group_lang")
    op.execute("DROP INDEX IF EXISTS ix_articles_lang")
    op.drop_column("articles", "translation_group_id")
    op.drop_column("articles", "lang")
