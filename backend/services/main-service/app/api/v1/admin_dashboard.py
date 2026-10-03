"""
Admin dashboard — stats + time series.

Two endpoints:

  GET /admin/dashboard
      Aggregate counts for the metric cards.

  GET /admin/dashboard/timeseries?days=30
      Daily buckets for users and orders, gap-filled with zeros so the
      chart has a continuous x-axis. `days` is clamped to [7, 90].

Every query is guarded — a missing table degrades to zeros instead of
a 500, since the panel is a glance, not a consistency check.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin", tags=["admin-dashboard"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(403, "Admin role required")
    return current_user


def _safe_count(db: Session, table: str) -> int:
    try:
        return int(db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0)
    except Exception:
        db.rollback()
        return 0


def _first_existing(db: Session, *tables: str) -> str | None:
    """Return the first table that exists. Lets us tolerate schema drift."""
    for t in tables:
        try:
            db.execute(text(f"SELECT 1 FROM {t} LIMIT 1"))
            return t
        except Exception:
            db.rollback()
    return None


@router.get("/dashboard")
async def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    total_users = _safe_count(db, "users")

    orders_table = _first_existing(db, "order_requests", "orders")
    total_orders = _safe_count(db, orders_table) if orders_table else 0

    total_projects = _safe_count(db, "projects")
    companies_table = _first_existing(db, "clients", "companies")
    total_companies = _safe_count(db, companies_table) if companies_table else 0
    total_articles = _safe_count(db, "articles")
    total_events = _safe_count(db, "events")
    total_team_members = _safe_count(db, "team_members")

    orders_this_month = 0
    if orders_table:
        try:
            month_start = datetime.utcnow().replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            orders_this_month = int(
                db.execute(
                    text(
                        f"SELECT COUNT(*) FROM {orders_table} "
                        f"WHERE created_at >= :start"
                    ),
                    {"start": month_start},
                ).scalar()
                or 0
            )
        except Exception:
            db.rollback()
            orders_this_month = 0

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_projects": total_projects,
        "total_companies": total_companies,
        "total_articles": total_articles,
        "total_events": total_events,
        "total_team_members": total_team_members,
        "orders_this_month": orders_this_month,
    }


@router.get("/dashboard/timeseries")
async def timeseries(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    """
    Daily counts for users and orders over the last `days` days.

    Returns a list of { date: "YYYY-MM-DD", users: int, orders: int },
    oldest first, one entry per calendar day. Days with no activity are
    zero-filled so the chart's x-axis is continuous.
    """
    today = datetime.utcnow().date()
    start_day = today - timedelta(days=days - 1)
    since = datetime.combine(start_day, datetime.min.time())

    # Pre-fill every day so gaps render as zero, not as a broken line.
    buckets: dict[str, dict[str, int]] = {}
    for i in range(days):
        d = start_day + timedelta(days=i)
        buckets[d.isoformat()] = {"users": 0, "orders": 0}

    def _fill(table: str, key: str) -> None:
        try:
            rows = db.execute(
                text(
                    f"SELECT date_trunc('day', created_at)::date AS day, "
                    f"COUNT(*) AS cnt FROM {table} "
                    f"WHERE created_at >= :since GROUP BY 1"
                ),
                {"since": since},
            ).fetchall()
            for day, cnt in rows:
                iso = day.isoformat()
                if iso in buckets:
                    buckets[iso][key] = int(cnt)
        except Exception:
            db.rollback()

    _fill("users", "users")

    orders_table = _first_existing(db, "order_requests", "orders")
    if orders_table:
        _fill(orders_table, "orders")

    return [
        {"date": iso, "users": v["users"], "orders": v["orders"]}
        for iso, v in sorted(buckets.items())
    ]
