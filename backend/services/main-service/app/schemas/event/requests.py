from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class EventTypeInput(BaseModel):
    """One type tag on an event. `type_id` OR `custom_name` must be set."""
    type_id: Optional[str] = None
    custom_name: Optional[str] = Field(None, max_length=120)

    @field_validator("custom_name")
    @classmethod
    def strip_custom(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else None


class EventSubmitRequest(BaseModel):
    """Payload for a user submitting a new event (goes to moderation)."""
    title: str = Field(..., min_length=3, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    href: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    metro: Optional[str] = None
    city: Optional[str] = None
    price: Optional[str] = None
    capacity: Optional[int] = None
    registration_url: Optional[str] = None
    organizer_id: Optional[str] = None
    # Multiple types allowed. Each entry is either an existing type id or
    # a free-text `custom_name` for a proposed type.
    types: List[EventTypeInput] = []
    # Tags are subdirections from the Vershiny taxonomy (M2M).
    subdirection_ids: List[str] = []


class EventAdminRequest(BaseModel):
    """Payload for an admin creating/updating an event. Includes moderation
    fields not exposed to submitters."""
    title: str = Field(..., min_length=3, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    href: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    metro: Optional[str] = None
    city: Optional[str] = None
    price: Optional[str] = None
    capacity: Optional[int] = None
    registration_url: Optional[str] = None
    organizer_id: Optional[str] = None
    types: List[EventTypeInput] = []
    subdirection_ids: List[str] = []
    custom_page: Optional[str] = None
    is_featured: bool = False
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    mdx_content: Optional[str] = None
    status: str = Field("approved", pattern="^(pending|approved|rejected)$")


class EventRejectRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=1000)


class OrganizerRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    slug: Optional[str] = Field(None, max_length=120)
    color: Optional[str] = Field(None, max_length=32)
    description: Optional[str] = None
    is_active: bool = True


class EventTypeRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: Optional[str] = Field(None, max_length=80)
    icon: Optional[str] = Field(None, max_length=80)
    color: Optional[str] = Field(None, max_length=32)
    sort_order: int = 0
    is_active: bool = True


class DirectionRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    slug: Optional[str] = Field(None, max_length=120)
    emoji: Optional[str] = Field(None, max_length=8)
    sort_order: int = 0
    is_active: bool = True


class SubdirectionRequest(BaseModel):
    direction_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=120)
    slug: Optional[str] = Field(None, max_length=120)
    sort_order: int = 0
    is_active: bool = True
