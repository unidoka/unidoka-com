"""Per-request API-key extraction + ContextVar plumbing.

HTTP transport carries an API key from the client to the MCP tools.
Every tool reads it via ``api_key_ctx`` to construct a per-request
UnidokaClient. The key is never persisted — it lives only for the
duration of the request.

Extraction order:
  1. ``X-API-Key`` header (preferred — no URL leakage)
  2. ``?api_key=`` query param (fallback for clients without header support)

Paths that bypass auth:
  • ``/health`` — used by Docker healthcheck
  • ``OPTIONS`` preflight — handled by CORSMiddleware outermost, but
    we short-circuit here too for safety
"""
import json
from contextvars import ContextVar
from urllib.parse import parse_qs


# Set per-request by ApiKeyMiddleware. Read by tools via _client().
api_key_ctx: ContextVar[str | None] = ContextVar("api_key", default=None)


def _extract_api_key(scope) -> str | None:
    # Header (preferred)
    for name, value in scope.get("headers", []):
        if name.lower() == b"x-api-key":
            v = value.decode("latin-1").strip()
            if v:
                return v

    # Query param (fallback)
    qs = scope.get("query_string", b"").decode("latin-1")
    if qs:
        params = parse_qs(qs)
        keys = params.get("api_key") or []
        if keys and keys[0]:
            return keys[0].strip()
    return None


async def _send(
    send, status: int, body: bytes, extra_headers: list[tuple[bytes, bytes]] | None = None
):
    headers = list(extra_headers or [(b"content-type", b"application/json")])
    headers.append((b"content-length", str(len(body)).encode()))
    await send({"type": "http.response.start", "status": status, "headers": headers})
    await send({"type": "http.response.body", "body": body})


class ApiKeyMiddleware:
    """Pure ASGI middleware — compatible with Starlette's add_middleware."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "/")

        # Health check bypass
        if path == "/health" or path.startswith("/health/"):
            await _send(send, 200, json.dumps({"status": "ok"}).encode())
            return

        # CORS preflight — CORSMiddleware normally handles this, but
        # if it's placed inside us (rare), we don't want 401s there.
        if scope.get("method") == "OPTIONS":
            await _send(
                send,
                204,
                b"",
                [
                    (b"access-control-allow-origin", b"*"),
                    (b"access-control-allow-methods", b"*"),
                    (b"access-control-allow-headers", b"*"),
                    (b"access-control-max-age", b"86400"),
                ],
            )
            return

        key = _extract_api_key(scope)
        if not key:
            body = json.dumps(
                {
                    "error": "unauthorized",
                    "detail": (
                        "X-API-Key header or ?api_key= query parameter is "
                        "required. Create one at /profile/api-keys."
                    ),
                }
            ).encode()
            await _send(send, 401, body)
            return

        token = api_key_ctx.set(key)
        try:
            await self.app(scope, receive, send)
        finally:
            api_key_ctx.reset(token)
