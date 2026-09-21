import time
from typing import Awaitable, Callable
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.responses import Response
from database.cache import cache_client

GLOBAL_LIMIT = 200
GLOBAL_WINDOW_SECONDS = 60

def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

async def global_rate_limit(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    ip = get_client_ip(request)
    key = f"rate_limit:{ip}"
    try:
        current_count = cache_client.incr(key)
        if current_count == 1:
            cache_client.expire(key, GLOBAL_WINDOW_SECONDS)
        if current_count > GLOBAL_LIMIT:
            ttl = cache_client.ttl(key)
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(ttl)},
                content={"detail": "Global request limit exceeded", "retry_after": ttl},
            )
    except Exception as e:
        print(f"[ERROR] Rate limiter cache error: {e}")
    return await call_next(request)

async def limit_otp_send(request: Request) -> None:
    ip = get_client_ip(request)
    key = f"otp_cooldown:{ip}"
    if cache_client.get(key):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    cache_client.setex(key, 5, "1")
