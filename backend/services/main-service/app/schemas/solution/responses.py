from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SolutionOut(BaseModel):
    id: UUID
    slug: str
    title: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    mdx_content: Optional[str] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    href: Optional[str] = None
    platform: Optional[str] = None
    category: Optional[str] = None
    period: Optional[str] = None
    tech_stack: List[str] = []
    tags: List[Dict[str, Any]] = []
    client_id: Optional[UUID] = None
    client_name: Optional[str] = None
    custom_page: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool
    status: str
    sort_order: int
    created_at: datetime
    updated_at: datetime
