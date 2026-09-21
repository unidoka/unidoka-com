import os
import redis

CACHE_USERNAME = os.getenv("CACHE_USERNAME")
CACHE_HOST = os.getenv("CACHE_HOST")
CACHE_PORT = int(os.getenv("CACHE_PORT", 6379))
CACHE_PASSWORD = os.getenv("CACHE_PASSWORD")
CACHE_DB = int(os.getenv("CACHE_DB", 0))

cache_client = redis.Redis(
    client_name="default",
    host=CACHE_HOST,
    port=CACHE_PORT,
    password=CACHE_PASSWORD,
    db=CACHE_DB,
    decode_responses=True
)