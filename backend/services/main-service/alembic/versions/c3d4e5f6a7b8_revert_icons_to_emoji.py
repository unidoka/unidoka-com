"""revert icon names back to emoji in event_directions
Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-10-08

Reverse of b2c3d4e5f6a7 — converts any rows that were already
transformed from emoji to icon-name back into their emoji form.
Safe to run even if b2c3d4e5f6a7 was never applied (no-op in that case).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

REVERSE_MAPPING = {
    "Laptop": "💻",
    "Palette": "✍",
    "Briefcase": "💼",
    "Robot": "🤖",
}

def upgrade() -> None:
    conn = op.get_bind()
    for icon_name, emoji in REVERSE_MAPPING.items():
        conn.execute(
            text("UPDATE event_directions SET emoji = :emoji WHERE emoji = :icon"),
            {"emoji": emoji, "icon": icon_name},
        )
    print(f"✅ Reverted {len(REVERSE_MAPPING)} icon names back to emoji.")

def downgrade() -> None:
    pass
