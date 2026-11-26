"""add optional page association to solutions

Revision ID: d9e0f1a2b3c4
Revises: c3d4e5f6a7b8
Create Date: 2026-11-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d9e0f1a2b3c4"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("solutions", sa.Column("page", sa.String(), nullable=True))
    op.create_index("ix_solutions_page", "solutions", ["page"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_solutions_page", table_name="solutions")
    op.drop_column("solutions", "page")
