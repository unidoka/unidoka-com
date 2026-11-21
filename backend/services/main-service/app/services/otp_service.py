import hmac
import json
import secrets
from datetime import datetime
from database.cache import cache_client

OTP_TTL_SECONDS = 300
OTP_MAX_ATTEMPTS = 5


def generate_otp() -> str:
    # secrets, not random: the Mersenne Twister state can be recovered
    # from a few outputs, which would let an attacker predict login and
    # verification codes.
    return str(secrets.randbelow(900000) + 100000)


def save_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    data = {"code": code, "created_at": datetime.utcnow().isoformat()}
    try:
        cache_client.setex(key, OTP_TTL_SECONDS, json.dumps(data))
        # A fresh code gets a fresh guess budget.
        cache_client.delete(f"otp_attempts:{identifier}")
        return True
    except Exception:
        return False


def verify_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    attempts_key = f"otp_attempts:{identifier}"
    stored = cache_client.get(key)
    if not stored:
        return False
    try:
        data = json.loads(stored)
        if hmac.compare_digest(str(data.get("code", "")), str(code)):
            cache_client.delete(key)
            cache_client.delete(attempts_key)
            return True
        # A 6-digit code is only 10^6 wide. Without an attempt cap the
        # global rate limit still allows ~1000 guesses per code lifetime.
        attempts = cache_client.incr(attempts_key)
        if attempts == 1:
            cache_client.expire(attempts_key, OTP_TTL_SECONDS)
        if attempts >= OTP_MAX_ATTEMPTS:
            cache_client.delete(key)
            cache_client.delete(attempts_key)
    except Exception:
        pass
    return False
