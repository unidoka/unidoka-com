"""Generation and hashing for API keys.

Key format: ``ud_live_`` + 64 hex chars (32 random bytes).

Security model:
  We DO NOT store the key itself, nor an encrypted version of it.
  We only store a SHA-256 hash. This means:
    * The raw key is shown to the user EXACTLY ONCE (on creation).
    * If a user loses the key, they cannot recover it — they must
      create a new one.
    * Even if the database is compromised, the attacker gets hashes,
      not usable API keys.
"""
import hashlib
import secrets

KEY_PREFIX_LEN = 12


def generate_api_key() -> str:
    return "ud_live_" + secrets.token_hex(32)


def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def key_prefix(key: str) -> str:
    return key[:KEY_PREFIX_LEN]
