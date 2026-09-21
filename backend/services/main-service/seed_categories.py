import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import the models so SQLAlchemy knows about them
from app.models.article_category import ArticleCategory
from app.models.project_category import ProjectCategory

DB_USER = os.getenv('MAIN_DB_USER', 'root')
DB_PASS = os.getenv('MAIN_DB_PASSWORD', '')
DB_HOST = os.getenv('MAIN_DB_HOST', 'localhost')
DB_PORT = os.getenv('MAIN_DB_PORT', '5432')
DB_NAME = os.getenv('MAIN_DB_NAME', 'main_db')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

ARTICLE_CATEGORIES = [
    ('business', 'Бизнес'),
    ('dev', 'Разработка'),
    ('design', 'Дизайн'),
    ('lifestyle', 'Лайфстайл'),
]

PROJECT_CATEGORIES = [
    ('e-commerce', 'E-commerce'),
    ('identity', 'Айдентика'),
    ('corporative', 'Корпоративные сайты'),
]

def seed():
    try:
        with Session() as session:
            # Insert/update article categories
            for code, label in ARTICLE_CATEGORIES:
                existing = session.query(ArticleCategory).filter_by(code=code).first()
                if existing:
                    existing.label = label
                else:
                    session.add(ArticleCategory(code=code, label=label))

            # Insert/update project categories
            for code, label in PROJECT_CATEGORIES:
                existing = session.query(ProjectCategory).filter_by(code=code).first()
                if existing:
                    existing.label = label
                else:
                    session.add(ProjectCategory(code=code, label=label))

            session.commit()
        print("✅ Categories seeded successfully.")
    except Exception as e:
        print(f"❌ Error seeding categories: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    seed()