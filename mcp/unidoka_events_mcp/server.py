"""MCP server exposing Unidoka's admin event endpoints as tools.

Configure via env:
    UNIDOKA_API_BASE   e.g. https://unidoka.com  or  http://localhost:8000
    UNIDOKA_API_KEY    uk_live_...  (create at /profile/api-keys)

Run directly:
    python -m unidoka_events_mcp.server
"""
from typing import Optional

from mcp.server.fastmcp import FastMCP

from .client import UnidokaClient, UnidokaError
from .middleware import api_key_ctx

mcp = FastMCP("unidoka-events")


def _client_or_raise() -> UnidokaClient:
    """Build a client for the current request.

    Under HTTP transport the API key arrives in ``api_key_ctx`` (set
    by ApiKeyMiddleware from ``X-API-Key`` or ``?api_key=``). Under
    stdio transport (local subprocess) the ContextVar is empty and we
    fall back to ``UNIDOKA_API_KEY`` from the environment — which
    preserves the pre-existing local usage.
    """
    per_request = api_key_ctx.get(None)
    if per_request:
        return UnidokaClient(api_key=per_request)
    return UnidokaClient()


def _clean(payload: dict) -> dict:
    return {k: v for k, v in payload.items() if v is not None and v != [] and v != ""}


@mcp.tool()
async def create_event(
    title: str,
    start_at: str,
    end_at: Optional[str] = None,
    slug: Optional[str] = None,
    short_description: Optional[str] = None,
    description: Optional[str] = None,
    mdx_content: Optional[str] = None,
    cover_image_src: Optional[str] = None,
    cover_video_src: Optional[str] = None,
    href: Optional[str] = None,
    registration_deadline: Optional[str] = None,
    location_name: Optional[str] = None,
    address: Optional[str] = None,
    metro: Optional[str] = None,
    city: Optional[str] = None,
    price: Optional[str] = None,
    capacity: Optional[int] = None,
    registration_url: Optional[str] = None,
    organizer_id: Optional[str] = None,
    custom_organizer_name: Optional[str] = None,
    subdirection_ids: Optional[list[str]] = None,
    status: str = "approved",
    is_featured: bool = False,
    seo_title: Optional[str] = None,
    meta_description: Optional[str] = None,
) -> dict:
    """Create an event. start_at / end_at / registration_deadline must be
    ISO-8601 strings, e.g. "2026-06-15T18:00:00Z". status is
    "pending" | "approved" | "rejected"."""
    payload = _clean({
        "title": title, "start_at": start_at, "end_at": end_at, "slug": slug,
        "short_description": short_description, "description": description,
        "mdx_content": mdx_content, "cover_image_src": cover_image_src,
        "cover_video_src": cover_video_src, "href": href,
        "registration_deadline": registration_deadline,
        "location_name": location_name, "address": address, "metro": metro,
        "city": city, "price": price, "capacity": capacity,
        "registration_url": registration_url, "organizer_id": organizer_id,
        "custom_organizer_name": custom_organizer_name,
        "subdirection_ids": subdirection_ids, "status": status,
        "seo_title": seo_title, "meta_description": meta_description,
    })
    payload["is_featured"] = is_featured
    try:
        return await _client_or_raise().create_event(payload)
    except UnidokaError as e:
        return {"error": str(e)}


@mcp.tool()
async def list_events(
    q: Optional[str] = None,
    status: Optional[str] = None,
    organizer_id: Optional[str] = None,
    limit: int = 50,
) -> dict:
    """List admin events. status is one of pending/approved/rejected."""
    params = _clean({"q": q, "status": status, "organizer_id": organizer_id})
    try:
        events = await _client_or_raise().list_events(params)
    except UnidokaError as e:
        return {"error": str(e)}
    if isinstance(events, list) and limit > 0:
        events = events[:limit]
    return {"events": events, "count": len(events) if isinstance(events, list) else 0}


@mcp.tool()
async def get_event(slug: str) -> dict:
    """Fetch a single event by slug (or UUID)."""
    try:
        return await _client_or_raise().get_event(slug)
    except UnidokaError as e:
        return {"error": str(e)}


@mcp.tool()
async def update_event(slug: str, patch: dict) -> dict:
    """PATCH an event. patch is a partial event payload — only keys
    present in it are applied."""
    try:
        return await _client_or_raise().update_event(slug, patch)
    except UnidokaError as e:
        return {"error": str(e)}


@mcp.tool()
async def delete_event(slug: str) -> dict:
    """Soft-delete an event by slug."""
    try:
        await _client_or_raise().delete_event(slug)
        return {"ok": True, "slug": slug}
    except UnidokaError as e:
        return {"error": str(e)}


@mcp.tool()
async def approve_event(slug: str) -> dict:
    """Approve a pending event."""
    try:
        return await _client_or_raise().approve_event(slug)
    except UnidokaError as e:
        return {"error": str(e)}


@mcp.tool()
async def reject_event(slug: str, reason: str) -> dict:
    """Reject a pending event with a rejection reason."""
    try:
        return await _client_or_raise().reject_event(slug, reason)
    except UnidokaError as e:
        return {"error": str(e)}


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
