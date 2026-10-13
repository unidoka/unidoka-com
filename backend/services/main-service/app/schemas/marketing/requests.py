from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ActionInput(BaseModel):
    label: str = Field(..., min_length=1, max_length=80)
    url: str = Field(..., min_length=1, max_length=500)
    # Visual weight of the button in the rendered placement.
    variant: str = Field("primary", pattern="^(primary|outlined|text)$")


class PlacementPayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    placement_type: str = Field(..., pattern="^(top|card|toast|dialog)$")
    page: str = Field("global", max_length=120)
    heading: Optional[str] = Field(None, max_length=300)
    body: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    # Zero buttons by default. Adding one is an explicit admin action.
    actions: List[ActionInput] = []
    accent_color: Optional[str] = Field(None, max_length=32)
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    is_active: bool = True
    priority: int = 0

    @field_validator("page")
    @classmethod
    def normalize_page(cls, v: str) -> str:
        # Lowercase, strip slashes so "events", "/events" and "/events/"
        # all match the same route prefix. `global` is reserved.
        v = (v or "global").strip().lower().strip("/")
        return v or "global"
