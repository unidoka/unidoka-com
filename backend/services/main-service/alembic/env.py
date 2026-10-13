import os
from logging.config import fileConfig
from pathlib import Path
import importlib

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Base + connection URL ──────────────────────────────────────────
from database.database import Base, DATABASE_URL

# ── Model registration ─────────────────────────────────────────────
# Every module under app/models/ is imported here so Base.metadata
# sees it. Alembic's autogenerate compares Base.metadata against the
# live DB — a model that isn't imported is invisible to that
# comparison, and the next `alembic revision --autogenerate` will
# produce a migration that drops its table.
#
# Auto-discovery rather than a hardcoded list: the earlier version
# named modules that don't exist in this repo, which broke the CLI
# on import. Walking the directory means a new model file is picked
# up automatically, and a module that fails to import is reported
# below without aborting the whole process.
_models_dir = Path(__file__).resolve().parent.parent / "app" / "models"
_import_failures: list[tuple[str, Exception]] = []

if _models_dir.is_dir():
    for py_file in sorted(_models_dir.glob("*.py")):
        # Skip dunder files and private helpers — they never hold models.
        if py_file.name.startswith("_"):
            continue
        module_name = f"app.models.{py_file.stem}"
        try:
            importlib.import_module(module_name)
        except Exception as exc:
            _import_failures.append((module_name, exc))

# Report what happened. A failed import usually means a broken model
# (a bad reference, a missing dependency) — that's a real bug the
# operator needs to see. But a broken model shouldn't stop you from
# running the migrations that already exist, so we warn rather than
# raise. The table count below is the "is my list complete?" signal.
if _import_failures:
    print("[alembic] WARNING — some model modules failed to import:")
    for name, exc in _import_failures:
        print(f"[alembic]   • {name}: {type(exc).__name__}: {exc}")
    print("[alembic] Their tables will be MISSING from autogenerate.")

print(
    f"[alembic] {len(Base.metadata.tables)} tables registered: "
    + ", ".join(sorted(Base.metadata.tables.keys()))
)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Устанавливаем URL из твоего .env / переменных окружения
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Указываем метаданные для autogenerate
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
