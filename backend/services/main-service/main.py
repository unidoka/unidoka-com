from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")

app = FastAPI(title="Main Service", version="1.0.0", root_path="/api")

# CORS
raw_origins = os.getenv("ALLOWED_ORIGINS")
origins = [origin.strip() for origin in raw_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(global_rate_limit)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main-service"}
