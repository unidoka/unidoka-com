import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

MAIN_DB_USER = os.getenv("MAIN_DB_USER")
MAIN_DB_PASSWORD = os.getenv("MAIN_DB_PASSWORD")
MAIN_DB_HOST = os.getenv("MAIN_DB_HOST")
MAIN_DB_PORT = os.getenv("MAIN_DB_PORT")
MAIN_DB_NAME = os.getenv("MAIN_DB_NAME")

DATABASE_URL = f"postgresql://{MAIN_DB_USER}:{MAIN_DB_PASSWORD}@{MAIN_DB_HOST}:{MAIN_DB_PORT}/{MAIN_DB_NAME}"

# This runs before logging.config is applied in main.py, so use print
# to make the target visible in `docker compose logs` from boot.
print(
    f"[database] target host={MAIN_DB_HOST} port={MAIN_DB_PORT} "
    f"name={MAIN_DB_NAME} user={MAIN_DB_USER}",
    flush=True,
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
