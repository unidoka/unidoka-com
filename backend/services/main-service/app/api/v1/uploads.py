"""
Generic image upload endpoint.

Every uploaded image is persisted under `storage/order_files/uploads/`,
which is bind-mounted into the Next.js container's `public/` directory
(see website/docker-compose.yml). The returned URL is same-origin, so
<img src={url}> works in prod without extra config.

Files are deduplicated by UUID name. Old uploads are NOT garbage
collected — orphaned files from repeated avatar edits will accumulate.
Add a nightly sweep if disk usage becomes a concern.
"""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.models.user import User
from app.shared.auth import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
}
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
STORAGE_ROOT = Path("/app/storage/order_files")
UPLOAD_SUBDIR = "uploads"


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported content type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 5 MB)")
    if len(contents) == 0:
        raise HTTPException(400, "Empty file")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTS:
        # HEIC from iOS, or missing extension: fall through to .jpg — the
        # browser already encoded the canvas output as JPEG/WebP.
        ext = ".jpg"

    target_dir = STORAGE_ROOT / UPLOAD_SUBDIR
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    (target_dir / name).write_bytes(contents)

    return {"url": f"/order_files/{UPLOAD_SUBDIR}/{name}"}
