from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class PlacementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    placement_type: str
    page: str
    heading: Optional[str] = None
    body: Optional[str] = None
    image_url: Optional[str] = None
    actions: List[dict] = []
    accent_color: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    is_active: bool
    priority: int
    created_at: datetime
    updated_at: datetime
