"""
Permission model.

Two roles can reach the admin panel: `admin` and `root`. The
difference is that `root` bypasses every check, while `admin` must
have an explicit grant in `user.permissions`.

Design invariants — any change to this file must preserve all of them:

  1. Root ALWAYS passes. `has_permission()` returns True for root
     before it looks at the permission set. This is what stops a root
     from locking themselves out by accident.

  2. Non-admin roles NEVER pass. A `user` or `client` with a
     permission in their JSONB column still gets 403 — the role gate
     fires first.

  3. Permission sets are validated against ADMIN_PERMISSIONS at write
     time. An unknown string in the DB is ignored at read time, but
     the API refuses to store one in the first place. A typo in the
     admin UI cannot silently grant nothing.

  4. Permissions are read fresh from the DB on every request.
     `get_current_user` loads the User row; nothing is cached in the
     JWT. A revoke takes effect on the next request, not the next
     login.

  5. There is exactly one check function. Every endpoint, in every
     admin file, routes through `require_permission(...)`. No
     ad-hoc role checks scattered through handlers.
"""

from fastapi import Depends, HTTPException, status

from app.models.user import User, UserRole


# ═══════════════════════════════════════════════════════════════════
# Canonical permission set
# ═══════════════════════════════════════════════════════════════════
# The frontend keeps a mirror of this list in website/utils/permissions.ts
# for rendering the checkboxes. Adding a permission here means adding
# it there too — the two lists describe the same product surface.
ADMIN_PERMISSIONS: frozenset[str] = frozenset({
    "admin.dashboard",
    "admin.users",
    "admin.orders",
    "admin.solutions",
    "admin.articles",
    "admin.events",
    "admin.catalog",
    "admin.vershiny",
    "admin.marketing",
    "admin.apikeys",
})


# ═══════════════════════════════════════════════════════════════════
# Read-side check
# ═══════════════════════════════════════════════════════════════════
def get_user_permissions(user: User) -> frozenset[str]:
    """Return the user's granted permissions as an immutable set.

    Defensive about the stored value: a JSONB column can hold anything
    a future migration or manual SQL puts there. Anything that isn't a
    list of strings resolves to an empty set, which is the safe
    default — no permissions, not all permissions.
    """
    raw = getattr(user, "permissions", None)
    if not isinstance(raw, list):
        return frozenset()
    return frozenset(p for p in raw if isinstance(p, str))


def has_permission(user: User, permission: str) -> bool:
    """The single source of truth for "is this user allowed?".

    Order matters. Root is checked first so a root with an empty or
    corrupted `permissions` column still passes. The role gate is
    checked second so a `user` who somehow has `["admin.users"]` in
    their row still gets 403.
    """
    if user is None:
        return False
    if user.user_role == UserRole.root:
        return True
    if user.user_role != UserRole.admin:
        return False
    return permission in get_user_permissions(user)


# ═══════════════════════════════════════════════════════════════════
# FastAPI dependency factory
# ═══════════════════════════════════════════════════════════════════
def require_permission(permission: str):
    """Return a dependency that enforces `permission` and yields the User.

    Usage in a route module:

        from app.shared.permissions import require_permission
        _require_admin = require_permission("admin.users")

    Then `Depends(_require_admin)` on any endpoint in that file. The
    returned user is available for handlers that need the actor (e.g.
    role-hierarchy checks on top of the permission check).
    """
    # Fail loud at import time, not at request time, if a typo'd
    # permission name reaches the factory. An endpoint guarded by a
    # nonexistent permission would otherwise be permanently
    # unreachable — a 403 no admin could ever fix.
    if permission not in ADMIN_PERMISSIONS:
        raise ValueError(
            f"require_permission({permission!r}): not in ADMIN_PERMISSIONS. "
            f"Known: {sorted(ADMIN_PERMISSIONS)}"
        )

    def _check(current_user: User = Depends(_get_current_user_dep())) -> User:
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission}",
            )
        return current_user

    return _check


def _get_current_user_dep():
    """Late import to break a circular reference.

    `app.shared.auth` imports `app.models.user`, and this module does
    too. Importing `get_current_user` at module top would work today
    but is fragile if auth ever needs to consult permissions. The
    late import costs nothing — FastAPI resolves it once at startup.
    """
    from app.shared.auth import get_current_user
    return get_current_user
