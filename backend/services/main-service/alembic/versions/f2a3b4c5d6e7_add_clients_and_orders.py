"""add clients + order_requests tables

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-10-04

The consult flow (`app/api/v1/consult.py`) references `Client` and
`OrderRequest`, but no prior migration created them. This adds both,
plus the `order_files` child table used by the admin orders page for
attachment rendering.

IDEMPOTENT: every CREATE is guarded, so a partial container restart
does not produce DuplicateTable on re-run.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f2a3b4c5d6e7"
down_revision: Union[str, None] = "e1f2a3b4c5d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(conn, name: str) -> bool:
    return sa.inspect(conn).has_table(name)


def _has_column(conn, table: str, column: str) -> bool:
    return any(c["name"] == column for c in sa.inspect(conn).get_columns(table))


def upgrade() -> None:
    conn = op.get_bind()

    # ── clients ─────────────────────────────────────────────────────
    if not _has_table(conn, "clients"):
        op.create_table(
            "clients",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("name", sa.String(), nullable=True),
            sa.Column("phone", sa.String(), nullable=True, index=True),
            sa.Column("email", sa.String(), nullable=True, index=True),
            sa.Column("telegram_username", sa.String(), nullable=True),
            sa.Column("role_title", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        )

    # ── order_requests ──────────────────────────────────────────────
    if not _has_table(conn, "order_requests"):
        op.create_table(
            "order_requests",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column(
                "client_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("clients.id"),
                nullable=True,
                index=True,
            ),
            sa.Column("service_types_json", postgresql.JSONB, nullable=True),
            sa.Column("about", sa.Text(), nullable=True),
            sa.Column("estimate_deadline", sa.String(), nullable=True),
            sa.Column("estimate_budget", sa.String(), nullable=True),
            sa.Column("naming_help", sa.String(), nullable=True),
            sa.Column(
                "status",
                sa.String(),
                nullable=False,
                server_default="new",
                index=True,
            ),
            sa.Column("cancellation_reason", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        )
    else:
        # Table exists but may be missing the moderation columns. Add
        # them individually so an older deploy can be upgraded in place.
        for col, ddl in [
            ("status", "VARCHAR NOT NULL DEFAULT 'new'"),
            ("cancellation_reason", "TEXT"),
            ("estimate_deadline", "VARCHAR"),
            ("estimate_budget", "VARCHAR"),
            ("naming_help", "VARCHAR"),
        ]:
            if not _has_column(conn, "order_requests", col):
                conn.execute(
                    sa.text(f"ALTER TABLE order_requests ADD COLUMN {col} {ddl}")
                )

    # ── order_files ─────────────────────────────────────────────────
    if not _has_table(conn, "order_files"):
        op.create_table(
            "order_files",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column(
                "order_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("order_requests.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            ),
            sa.Column("filename", sa.String(), nullable=False),
            sa.Column("file_path", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS order_files CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS order_requests CASCADE"))
    conn.execute(sa.text("DROP TABLE IF EXISTS clients CASCADE"))
