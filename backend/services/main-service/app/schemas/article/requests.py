from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class ArticlePayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    category: Optional[str] = None
    tags: List[Dict[str, Any]] = []
    author_name: Optional[str] = None
    author_avatar_url: Optional[str] = None
    is_team_author: bool = True
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool = False
    status: str = Field("draft", pattern="^(draft|published|archived)$")
    sort_order: int = 0
    published_at: Optional[datetime] = None
