# Unidoka events — MCP server

Exposes the admin event endpoints as MCP tools. Two transports:

- **stdio** — local subprocess, key from env (`UNIDOKA_API_KEY`)
- **HTTP**  — remote, key from `X-API-Key` header (or `?api_key=`) per request

The HTTP transport is what you use from Claude Code, Cursor, Hermes,
or any other MCP client that speaks Streamable HTTP.

---

## Prerequisites

You need an **API key**. Get one:

1. Sign in to Unidoka.
2. Go to **`/profile/api-keys`**.
3. Click **Create key**, name it (e.g. "Claude Code"), copy `ud_live_...`.

The key acts as your account. Your role and permissions determine what
the MCP tools can do — the events endpoints require `admin` role (root
always passes) and the `admin.events` permission.

---

## Connect via URL

Two URLs, one API key:

| Environment | URL |
|---|---|
| **Production** | `https://unidoka.com/mcp` |
| **Local dev** | `http://localhost:8001/mcp` (direct) or `http://localhost:3000/mcp` (via Next.js rewrite) |

### Claude Code

```bash
claude mcp add --transport http unidoka-events \
  https://unidoka.com/mcp \
  --header "X-API-Key: ud_live_REPLACE_ME"
```

Or add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "unidoka-events": {
      "type": "http",
      "url": "https://unidoka.com/mcp",
      "headers": {
        "X-API-Key": "ud_live_REPLACE_ME"
      }
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in your project, or the global config:

```json
{
  "mcpServers": {
    "unidoka-events": {
      "url": "https://unidoka.com/mcp",
      "headers": {
        "X-API-Key": "ud_live_REPLACE_ME"
      }
    }
  }
}
```

### Hermes (or any client without header support)

Use the query-param fallback:

```json
{
  "mcpServers": {
    "unidoka-events": {
      "url": "https://unidoka.com/mcp?api_key=ud_live_REPLACE_ME"
    }
  }
}
```

Note: the key appears in access logs when passed via query param. Prefer
`X-API-Key` whenever the client supports it.

### Claude Desktop (local stdio)

Claude Desktop does not currently speak Streamable HTTP natively. Run
the server as a local subprocess — it will hit the same backend over
HTTPS using `UNIDOKA_API_KEY`:

```json
{
  "mcpServers": {
    "unidoka-events": {
      "command": "python",
      "args": ["-m", "unidoka_events_mcp.server"],
      "env": {
        "UNIDOKA_API_BASE": "https://unidoka.com",
        "UNIDOKA_API_KEY": "ud_live_REPLACE_ME"
      }
    }
  }
}
```

Install the local package first:

```bash
pip install -e mcp/
```

---

## Local run (self-host the HTTP server)

```bash
# Build and start just the MCP container
docker compose -f docker-compose.dev.yml up -d mcp-server

# Health
curl http://localhost:8001/health
# -> {"status":"ok"}

# Verify auth works
curl -X POST http://localhost:8001/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ud_live_..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"0.0.1"}}}'
```

Without a key you'll get `401 {"error":"unauthorized","detail":"..."}` — that's expected.

---

## Tools

| Tool | Description |
|---|---|
| `create_event` | Create a new event. `start_at` is required (ISO-8601). |
| `list_events` | List with optional filters `q`, `status`, `organizer_id`. |
| `get_event` | Fetch a single event by slug/UUID. |
| `update_event` | Partial PATCH. Pass only the keys you want to change. |
| `delete_event` | Soft-delete. |
| `approve_event` | Approve a pending event. |
| `reject_event` | Reject with a required reason. |

---

## Example prompt

> Use the unidoka-events tool to create an event titled "Python Meetup
> Moscow" on 2026-05-20T19:00:00Z at "Кутузовский проезд 12", 500
> capacity, free, approved.

The MCP layer extracts your API key from the request and forwards it to
the backend. The backend independently verifies your role — a non-admin
key will get `403` back, even though the MCP call itself succeeded past
auth.

---

## Revoking access

Go to `/profile/api-keys`, find the key, click **Revoke**. All in-flight
requests with that key start returning `401` immediately — no caching,
no propagation delay.

If you suspect a key leaked, revoke first, then create a replacement.

---

## Architecture

```text
                        Client (Claude Code / Cursor / Hermes)
                                     │
                                     │ HTTPS POST /mcp
                                     │ X-API-Key: ud_live_...
                                     ▼
                               ┌─────────────┐
                               │   Traefik   │  (prod)
                               │ PathPrefix  │
                               │   /mcp      │
                               └──────┬──────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │ mcp-server  │
                               │ :8001       │
                               │             │
                               │ ApiKey      │◄── extracts key,
                               │ Middleware  │    sets ContextVar
                               │             │
                               │ FastMCP     │◄── tools read key,
                               │ /mcp        │    build client
                               └──────┬──────┘
                                      │
                                      │ POST /api/v1/admin/events
                                      │ X-API-Key: ud_live_...
                                      ▼
                               ┌─────────────┐
                               │main-service │
                               │             │
                               │ require_    │◄── checks user role
                               │ admin       │    and permission
                               └─────────────┘
```

The MCP layer enforces *presence* of a key. The backend enforces *validity*
and *authorization*. Two independent checks — a compromised MCP container
alone cannot create events without a valid admin key flowing through.
