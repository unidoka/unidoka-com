"""sync users table with model
Revision ID: b1c2d3e4f5a6
Revises: 9ae240940cf1
Create Date: 2026-10-01 00:00:00
The initial migration (9ae240940cf1) created a `users` table that does not
match `app/models/user.py`:
  - column was named `role`, not `user_role`
  - the `user_role` enum used values USER/ADMIN/ROOT (uppercase), but the
    model defines client/user/admin/root (lowercase)
  - nine columns the model declares were never created: username, name,
    surname, description, avatar_url, vk_public_username, user_status,
    verified (and `user_role` itself)
This migration brings the schema in line with the model. It is destructive
against the old `role` column — the value space doesn't map cleanly, and the
table has no production rows (the schema was broken, so the service could not
have written any). Safe to run against a dev DB.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "9ae240940cf1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    # 1. Drop the stale `role` column and its enum. Postgres lets us drop
    # the enum only after the column that references it is gone.
    conn.execute(sa.text("ALTER TABLE users DROP COLUMN IF EXISTS role"))
    conn.execute(sa.text("DROP TYPE IF EXISTS user_role"))
    # 2. Create the correct enums.
    conn.execute(sa.text(
        "CREATE TYPE user_role AS ENUM ('client','user','admin','root')"
    ))
    conn.execute(sa.text(
        "CREATE TYPE user_status AS ENUM "
        "('pending_verification','verificated','blocked')"
    ))
    # 3. Add missing columns. All are nullable or have a server default,
    # so they can be added to a live table without a rewrite.
    op.add_column("users", sa.Column("username", sa.String(), nullable=True))
    op.add_column("users", sa.Column("name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("surname", sa.String(), nullable=True))
    op.add_column("users", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))
    op.add_column("users", sa.Column("vk_public_username", sa.String(), nullable=True))
    conn.execute(sa.text(
        "ALTER TABLE users "
        "ADD COLUMN user_role user_role NOT NULL DEFAULT 'user'"
    ))
    conn.execute(sa.text(
        "ALTER TABLE users "
        "ADD COLUMN user_status user_status NOT NULL "
        "DEFAULT 'pending_verification'"
    ))
    op.add_column(
        "users",
        sa.Column(
            "verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    # 4. Uniqueness on the two new identifier-like columns.
    op.create_unique_constraint(
        "users_username_key", "users", ["username"]
    )
    op.create_unique_constraint(
        "users_vk_public_username_key", "users", ["vk_public_username"]
    )

def downgrade() -> None:
    op.drop_constraint("users_vk_public_username_key", "users", type_="unique")
    op.drop_constraint("users_username_key", "users", type_="unique")
    op.drop_column("users", "verified")
    op.drop_column("users", "user_status")
    op.drop_column("users", "user_role")
    op.drop_column("users", "vk_public_username")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "description")
    op.drop_column("users", "surname")
    op.drop_column("users", "name")
    op.drop_column("users", "username")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP TYPE IF EXISTS user_role")
    # Restore the legacy column so 9ae240940cf1 stays reversible.
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.Enum("USER", "ADMIN", "ROOT", name="user_role"),
            nullable=False,
            server_default="USER",
        ),
    )
