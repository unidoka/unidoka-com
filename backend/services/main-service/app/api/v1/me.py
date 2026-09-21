from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import User
from app.shared.auth import get_current_user, hash_password, verify_password
from database.database import get_db

router = APIRouter(prefix="/me", tags=["me"])

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)

@router.patch("")
async def update_me(
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Update only provided fields
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(current_user, key):
            setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "surname": current_user.surname,
        "phone": current_user.phone,
        "description": current_user.description,
        "avatar_url": current_user.avatar_url,
    }

@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
