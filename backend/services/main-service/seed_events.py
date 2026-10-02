"""
Seed the events taxonomy: Vershiny directions + subdirections, base event
types, and organizers. Idempotent — re-running updates existing rows.

    python seed_events.py

Run AFTER `alembic upgrade head`.
"""
import os
import re
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.event import (
    Organizer, EventType, EventDirection, EventSubdirection,
)

DB_USER = os.getenv("MAIN_DB_USER", "root")
DB_PASS = os.getenv("MAIN_DB_PASSWORD", "")
DB_HOST = os.getenv("MAIN_DB_HOST", "localhost")
DB_PORT = os.getenv("MAIN_DB_PORT", "5432")
DB_NAME = os.getenv("MAIN_DB_NAME", "main_db")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")


# ── Vershiny directions + subdirections ──────────────────────────────────
DIRECTIONS = [
    {
        "name": "Software-разработка",
        "emoji": "💻",
        "sort_order": 1,
        "subs": [
            "Веб-разработка",
            "DevOps",
            "ML",
            "Flutter: desktop и мобильная разработка",
            "Инфобез",
            "1С",
            "UX/UI-дизайн",
        ],
    },
    {
        "name": "Дизайн",
        "emoji": "✍",
        "sort_order": 2,
        "subs": [
            "3D",
            "Видеопроизводство",
            "Графический дизайн",
        ],
    },
    {
        "name": "Бизнес",
        "emoji": "💼",
        "sort_order": 3,
        "subs": [
            "Бизнес-аналитика и экономика",
            "SMM",
            "Публичные выступления",
        ],
    },
    {
        "name": "Hardware-разработка",
        "emoji": "🤖",
        "sort_order": 4,
        "subs": [
            "Разработка микроконтроллеров",
            "Дроны",
            "3D-печать",
        ],
    },
]

# ── Event types (base set) ───────────────────────────────────────────────
TYPES = [
    ("IT", "cpu", "#3b82f6"),
    ("Бизнес", "briefcase", "#f59e0b"),
    ("Дизайн", "palette", "#ec4899"),
    ("Досуг", "coffee", "#10b981"),
    ("Искусство", "paint-brush", "#a855f7"),
    ("Дипломатия", "globe", "#6366f1"),
    ("Строительство", "buildings", "#f97316"),
    ("Наука", "flask", "#06b6d4"),
    ("Медиа", "megaphone", "#ef4444"),
    ("Спорт", "barbell", "#84cc16"),
]

# ── Organizers ───────────────────────────────────────────────────────────
ORGANIZERS = [
    ("Росмолодёжь", "#336DFF"),
    ("Росконгресс", "#E8590C"),
    ("Юнидока", "#0CA678"),
    ("unidoka.com", "#845EF7"),
]


def seed():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    try:
        with Session() as s:
            # Directions + subdirections
            for d in DIRECTIONS:
                slug = slugify(d["name"])
                direction = s.query(EventDirection).filter_by(slug=slug).first()
                if direction:
                    direction.name = d["name"]
                    direction.emoji = d["emoji"]
                    direction.sort_order = d["sort_order"]
                else:
                    direction = EventDirection(
                        name=d["name"], slug=slug,
                        emoji=d["emoji"], sort_order=d["sort_order"],
                    )
                    s.add(direction)
                    s.flush()

                for i, sub in enumerate(d["subs"]):
                    sslug = slugify(sub)
                    sub_row = s.query(EventSubdirection).filter_by(slug=sslug).first()
                    if sub_row:
                        sub_row.name = sub
                        sub_row.direction_id = direction.id
                        sub_row.sort_order = i
                    else:
                        s.add(EventSubdirection(
                            direction_id=direction.id,
                            name=sub, slug=sslug, sort_order=i,
                        ))

            # Event types
            for i, (name, icon, color) in enumerate(TYPES):
                slug = slugify(name)
                t = s.query(EventType).filter_by(slug=slug).first()
                if t:
                    t.name = name
                    t.icon = icon
                    t.color = color
                    t.sort_order = i
                else:
                    s.add(EventType(
                        name=name, slug=slug,
                        icon=icon, color=color, sort_order=i,
                    ))

            # Organizers
            for name, color in ORGANIZERS:
                slug = slugify(name)
                o = s.query(Organizer).filter_by(slug=slug).first()
                if o:
                    o.name = name
                    o.color = color
                else:
                    s.add(Organizer(name=name, slug=slug, color=color))

            s.commit()
        print("✅ Events taxonomy seeded successfully.")
    except Exception as e:
        print(f"❌ Error seeding events taxonomy: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    seed()
