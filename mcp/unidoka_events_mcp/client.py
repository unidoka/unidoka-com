"""Thin HTTP client for the Unidoka admin events API."""
import os

import httpx


class UnidokaError(RuntimeError):
    pass


class UnidokaClient:
    def __init__(self, base_url: str | None = None, api_key: str | None = None) -> None:
        self.base_url = (
            base_url or os.getenv("UNIDOKA_API_BASE") or "http://localhost:8000"
        ).rstrip("/")
        self.api_key = api_key or os.getenv("UNIDOKA_API_KEY") or ""
        if not self.api_key:
            raise UnidokaError(
                "UNIDOKA_API_KEY is not set. Create a key at "
                "/profile/api-keys (or /admin/<secret>/api-keys) and set "
                "it in the environment."
            )

    async def _request(self, method: str, path: str, **kwargs):
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.request(
                method,
                f"{self.base_url}{path}",
                headers={"X-API-Key": self.api_key},
                **kwargs,
            )
        if r.status_code >= 400:
            raise UnidokaError(f"{r.status_code}: {r.text}")
        if r.status_code == 204 or not r.content:
            return {}
        return r.json()

    async def create_event(self, payload: dict) -> dict:
        return await self._request("POST", "/api/v1/admin/events", json=payload)

    async def list_events(self, params: dict | None = None) -> list:
        return await self._request("GET", "/api/v1/admin/events", params=params or {})

    async def get_event(self, slug: str) -> dict:
        return await self._request("GET", f"/api/v1/admin/events/{slug}")

    async def update_event(self, slug: str, patch: dict) -> dict:
        return await self._request("PATCH", f"/api/v1/admin/events/{slug}", json=patch)

    async def delete_event(self, slug: str) -> dict:
        return await self._request("DELETE", f"/api/v1/admin/events/{slug}")

    async def approve_event(self, slug: str) -> dict:
        return await self._request("POST", f"/api/v1/admin/events/{slug}/approve")

    async def reject_event(self, slug: str, reason: str) -> dict:
        return await self._request(
            "POST", f"/api/v1/admin/events/{slug}/reject", json={"reason": reason}
        )
