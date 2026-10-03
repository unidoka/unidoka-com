from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class OrganizerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    color: Optional[str] = None
    avatar_url: Optional[str] = None
    owner_id: Optional[str] = None
    description: Optional[str] = None
    is_active: bool


class EventTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: int
    is_active: bool


class SubdirectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    direction_id: str
    name: str
    slug: str
    sort_order: int
    is_active: bool


class DirectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    emoji: Optional[str] = None
    sort_order: int
    is_active: bool
    subdirections: List[SubdirectionOut] = []


class EventTypeAssignmentOut(BaseModel):
    id: str
    type_id: Optional[str] = None
    custom_name: Optional[str] = None
    type: Optional[EventTypeOut] = None


class EventAuthorOut(BaseModel):
    id: str
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None


class EventListItem(BaseModel):
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    price: Optional[str] = None
    capacity: Optional[int] = None
    registration_url: Optional[str] = None
    is_featured: bool
    status: str
    custom_page: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    organizer: Optional[OrganizerOut] = None
    custom_organizer_name: Optional[str] = None
    types: List[EventTypeAssignmentOut] = []
    tags: List[SubdirectionOut] = []
    other_dates: List[Dict[str, Any]] = []


class EventDetail(EventListItem):
    description: Optional[str] = None
    metro: Optional[str] = None
    city: Optional[str] = None
    href: Optional[str] = None
    mdx_content: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    rejection_reason: Optional[str] = None
    submitted_by: Optional[EventAuthorOut] = None
    submitted_by_id: Optional[str] = None
    reviewed_by_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
