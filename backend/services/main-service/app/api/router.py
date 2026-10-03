from fastapi import APIRouter
from app.api.v1 import (
    auth,
    admin,
    admin_dashboard,
    admin_users,
    admin_users_notifications,
    admin_events,
    admin_orders,
    me,
    events,
    uploads,
    notifications,
    users,
)

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(admin_dashboard.router)
router.include_router(admin_users.router)
router.include_router(admin_users_notifications.router)
router.include_router(admin_events.router)
router.include_router(admin_orders.router)
router.include_router(me.router)
router.include_router(notifications.router)
router.include_router(events.router)
router.include_router(uploads.router)
router.include_router(users.router)
