"""HTTP entry point for the MCP server.

FastMCP's Streamable HTTP transport is served at ``/mcp``. Two
middlewares wrap it:

  • ApiKeyMiddleware  — extracts X-API-Key / ?api_key, sets ContextVar
  • CORSMiddleware    — outermost, handles preflight without reaching auth

Run:
    uvicorn unidoka_events_mcp.http_server:app --host 0.0.0.0 --port 8001
or
    unidoka-events-mcp-http
"""
import os

from starlette.middleware.cors import CORSMiddleware

from .middleware import ApiKeyMiddleware
from .server import mcp


def create_app():
    app = mcp.streamable_http_app()
    # Order matters: last added = outermost.
    # Request flow (outer -> inner): CORS -> ApiKey -> FastMCP.
    app.add_middleware(ApiKeyMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        allow_credentials=False,
    )
    return app


app = create_app()


def run():
    import uvicorn

    uvicorn.run(
        "unidoka_events_mcp.http_server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8001")),
        log_level="info",
    )


if __name__ == "__main__":
    run()
