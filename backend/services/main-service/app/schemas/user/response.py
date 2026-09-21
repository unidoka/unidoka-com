from pydantic import BaseModel, ConfigDict
from uuid import UUID

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    blocked: bool
    verified: bool
    role: str
