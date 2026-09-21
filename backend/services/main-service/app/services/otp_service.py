import random
import json
from datetime import datetime, timedelta
from database.cache import cache_client

OTP_TTL_SECONDS = 300

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def save_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    data = {"code": code, "created_at": datetime.utcnow().isoformat()}
    try:
        cache_client.setex(key, OTP_TTL_SECONDS, json.dumps(data))
        return True
    except Exception:
        return False

def verify_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    stored = cache_client.get(key)
    if not stored:
        return False
    try:
        data = json.loads(stored)
        if data.get("code") == code:
            cache_client.delete(key)
            return True
    except Exception:
        pass
    return False
