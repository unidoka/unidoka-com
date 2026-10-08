from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class SolutionPayload(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    short_description: Optional[str] = Field(None, max_length=500)
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
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    custom_page: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: bool = False
    status: str = Field("draft", pattern="^(draft|published|archived)$")
    sort_order: int = 0
