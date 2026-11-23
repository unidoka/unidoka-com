from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    description: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    category: Optional[str] = None
    tags: List[Dict[str, Any]] = []
    author_name: Optional[str] = None
    author_avatar_url: Optional[str] = None
    is_team_author: bool
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool
    status: str
    sort_order: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
