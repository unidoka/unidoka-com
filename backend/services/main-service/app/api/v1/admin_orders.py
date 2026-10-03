"""
Admin endpoints for consultation / order requests.

Reads are open to admin + root. Status updates are admin + root.
Cancellation requires a reason.
"""
import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.shared.auth import get_current_user
from database.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/order-requests", tags=["admin-orders"])

ALLOWED_STATUSES = {"new", "negotiating", "work", "done", "canceled"}


# ── Guards ───────────────────────────────────────────────────────────

def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    role = current_user.user_role
    if role not in (UserRole.admin, UserRole.root):
        raise HTTPException(403, "Admin role required")
    return current_user


# ── Schemas ──────────────────────────────────────────────────────────

class OrderStatusUpdate(BaseModel):
    status: str
    cancellation_reason: Optional[str] = None


# ── Serialization ────────────────────────────────────────────────────

def _serialize(order, db: Session) -> dict:
    """
    Defensive serialization. The OrderRequest model was defined by the
    consult flow; some moderation columns may or may not exist in a
    given deployment. We use getattr with defaults so the endpoint
    never 500s on a missing column — the migration in
    f2a3b4c5d6e7 makes them all present, but this keeps older DBs
    readable too.
    """
    client = None
    client_id = getattr(order, "client_id", None)
    if client_id:
        try:
            from app.models.client import Client
            client = db.get(Client, client_id)
        except Exception:
            client = None

    files = []
    try:
        for f in getattr(order, "files", []) or []:
            files.append(
                {
                    "id": str(getattr(f, "id", "")),
                    "filename": getattr(f, "filename", "") or "",
                    "file_path": getattr(f, "file_path", "") or "",
                }
            )
    except Exception:
        files = []

    svc = getattr(order, "service_types_json", None)
    if not isinstance(svc, list):
        svc = []

    created = getattr(order, "created_at", None)
    return {
        "id": str(order.id),
        "contact_id": str(client_id) if client_id else None,
        "service_types_json": svc,
        "about": getattr(order, "about", "") or "",
        "estimate_deadline": getattr(order, "estimate_deadline", "") or "",
        "estimate_budget": getattr(order, "estimate_budget", "") or "",
        "naming_help": getattr(order, "naming_help", "") or "",
        "status": getattr(order, "status", "new") or "new",
        "cancellation_reason": getattr(order, "cancellation_reason", None),
        "created_at": created.isoformat() if created else None,
        "files": files,
        "contact": (
            {
                "id": str(client.id),
                "name": getattr(client, "name", None),
                "phone": getattr(client, "phone", None),
                "email": getattr(client, "email", None),
                "telegram_username": getattr(client, "telegram_username", None),
            }
            if client
            else None
        ),
    }


def _load_order(db: Session, order_id: uuid.UUID):
    from app.models.order_request import OrderRequest
    order = db.get(OrderRequest, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order


# ── Endpoints ────────────────────────────────────────────────────────

@router.get("")
async def list_order_requests(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
) -> List[dict]:
    try:
        from app.models.order_request import OrderRequest
    except ImportError:
        logger.error("OrderRequest model not importable — returning empty list")
        return []

    try:
        rows = (
            db.query(OrderRequest)
            .order_by(OrderRequest.created_at.desc())
            .limit(500)
            .all()
        )
    except Exception as e:
        logger.exception("Failed to query order_requests: %s", e)
        db.rollback()
        return []

    return [_serialize(o, db) for o in rows]


@router.get("/{order_id}")
async def get_order_request(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
) -> dict:
    return _serialize(_load_order(db, order_id), db)


@router.patch("/{order_id}")
async def update_order_request(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
) -> dict:
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(
            422,
            f"status must be one of {sorted(ALLOWED_STATUSES)}",
        )
    if payload.status == "canceled" and not (payload.cancellation_reason or "").strip():
        raise HTTPException(422, "cancellation_reason is required when cancelling")

    order = _load_order(db, order_id)

    # Set only what the model actually has. A DB that hasn't run the
    # f2a3b4c5d6e7 migration yet still accepts status if the column
    # happens to exist — otherwise we return a clear error.
    if not hasattr(order, "status"):
        raise HTTPException(
            500,
            "order_requests.status column missing — run `alembic upgrade head`",
        )
    order.status = payload.status

    if hasattr(order, "cancellation_reason"):
        order.cancellation_reason = (
            payload.cancellation_reason if payload.status == "canceled" else None
        )

    db.commit()
    db.refresh(order)
    return _serialize(order, db)


@router.get("/stats/counts")
async def order_stats(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
) -> dict:
    """Cheap aggregate for the badge counters on the admin sidebar / dashboard."""
    try:
        from app.models.order_request import OrderRequest
    except ImportError:
        return {"total": 0, "by_status": {}}

    try:
        total = db.query(func.count(OrderRequest.id)).scalar() or 0
        rows = (
            db.query(OrderRequest.status, func.count(OrderRequest.id))
            .group_by(OrderRequest.status)
            .all()
        )
        by_status = {str(s or "new"): int(c) for s, c in rows}
    except Exception:
        db.rollback()
        total, by_status = 0, {}

    return {"total": int(total), "by_status": by_status}
