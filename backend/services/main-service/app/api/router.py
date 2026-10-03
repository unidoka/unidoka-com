from fastapi import APIRouter

from app.api.v1 import (
    auth, admin, me, events, admin_events, uploads, notifications,
)

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(me.router)
router.include_router(notifications.router)
router.include_router(events.router)
router.include_router(admin_events.router)
router.include_router(uploads.router)
