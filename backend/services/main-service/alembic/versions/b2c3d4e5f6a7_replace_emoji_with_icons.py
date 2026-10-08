"""replace emoji values with Phosphor icon names
Revision ID: b2c3d4e5f6a7
Revises: f1a2b3c4d5e6
Create Date: 2026-10-08

Converts any existing rows in `event_directions.emoji` that still hold
a raw emoji character into the corresponding Phosphor icon name.
The column itself is untouched — it now stores icon names instead.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MAPPING = {
    "💻": "Laptop",
    "✍": "Palette",
    "💼": "Briefcase",
    "🤖": "Robot",
}

def upgrade() -> None:
    conn = op.get_bind()
    for emoji, icon_name in MAPPING.items():
        conn.execute(
            text("UPDATE event_directions SET emoji = :icon WHERE emoji = :emoji"),
            {"icon": icon_name, "emoji": emoji},
        )
    print(f"✅ Updated {len(MAPPING)} emoji mappings to icon names.")

def downgrade() -> None:
    conn = op.get_bind()
    for emoji, icon_name in MAPPING.items():
        conn.execute(
            text("UPDATE event_directions SET emoji = :emoji WHERE emoji = :icon"),
            {"icon": icon_name, "emoji": emoji},
        )
