from pydantic import BaseModel
from uuid import UUID

class FileUploadResponse(BaseModel):
    id: UUID
    url: str
    filename: str
