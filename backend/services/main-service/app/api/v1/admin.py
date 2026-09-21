from fastapi import APIRouter, Depends, HTTPException
from app.shared.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user
