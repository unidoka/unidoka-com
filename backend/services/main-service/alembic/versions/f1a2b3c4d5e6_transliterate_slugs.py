"""transliterate existing Cyrillic slugs to Latin
Revision ID: f1a2b3c4d5e6
Revises: f2a3b4c5d6e7
Create Date: 2026-10-08
Finds every event with a non-Latin slug and replaces it with a
transliterated Latin equivalent. Handles collisions by appending a
numeric suffix.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "f2a3b4c5d6e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
}

def _transliterate(slug: str) -> str:
    slug = slug.lower()
    result = "".join(TRANSLIT_MAP.get(char, char) for char in slug)
    import re
    result = re.sub(r"[^\w\s-]", "", result, flags=re.UNICODE)
    result = re.sub(r"[\s_]+", "-", result)
    return re.sub(r"-+", "-", result).strip("-")

def upgrade() -> None:
    conn = op.get_bind()
    # Fetch all events that might have non-Latin slugs
    events = conn.execute(text("SELECT id, slug FROM events WHERE deleted_at IS NULL")).fetchall()
    for event_id, old_slug in events:
        if not old_slug:
            continue
        # Check if slug has non-Latin chars
        if any(ord(c) > 127 for c in old_slug):
            new_slug = _transliterate(old_slug)
            if new_slug == old_slug:
                continue
            # Handle collisions
            existing = conn.execute(
                text("SELECT id FROM events WHERE slug = :slug AND id != :id"),
                {"slug": new_slug, "id": event_id}
            ).fetchone()
            if existing:
                # Append a short uuid to resolve collision
                import uuid
                new_slug = f"{new_slug}-{uuid.uuid4().hex[:6]}"
            conn.execute(
                text("UPDATE events SET slug = :slug WHERE id = :id"),
                {"slug": new_slug, "id": event_id}
            )

def downgrade() -> None:
    # Cannot reliably reverse transliteration, so this is a no-op.
    pass
