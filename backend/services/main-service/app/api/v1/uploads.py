"""
Generic image/video upload endpoints.

Every uploaded file is persisted under `storage/order_files/<folder>/`,
where `<folder>` identifies the owning area ("articles", "solutions",
"orders", ...). The Next.js container mounts the same directory under
`public/order_files`, so the returned URL is same-origin: <img src={url}>
and <video src={url}> work in prod without extra config.

Files are deduplicated by UUID name. Old uploads are NOT garbage
collected — orphaned files from repeated avatar edits will accumulate.
Add a nightly sweep if disk usage becomes a concern.
"""
import asyncio
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.models.user import User
from app.shared.auth import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_BYTES = 20 * 1024 * 1024  # 20 MB
MAX_VIDEO_BYTES = 100 * 1024 * 1024  # 100 MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
}
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
}
ALLOWED_VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}
STORAGE_ROOT = Path("/app/storage/order_files")

# Only these directories can be created under the storage root. Unknown
# values fall back to "misc" instead of letting the client pick a path.
UPLOAD_FOLDERS = {
    "orders",
    "articles",
    "solutions",
    "events",
    "marketing",
    "companies",
    "organizers",
    "avatars",
    "misc",
}
DEFAULT_FOLDER = "misc"


def _folder(name: Optional[str]) -> str:
    folder = (name or "").strip().lower()
    return folder if folder in UPLOAD_FOLDERS else DEFAULT_FOLDER


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form(DEFAULT_FOLDER),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported content type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 20 MB)")
    if len(contents) == 0:
        raise HTTPException(400, "Empty file")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTS:
        # HEIC from iOS, or missing extension: fall through to .jpg — the
        # browser already encoded the canvas output as JPEG/WebP.
        ext = ".jpg"

    subdir = _folder(folder)
    target_dir = STORAGE_ROOT / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    (target_dir / name).write_bytes(contents)

    return {"url": f"/order_files/{subdir}/{name}"}


async def _trim_video(
    source: Path, start: Optional[float], end: Optional[float]
) -> Path:
    """Cut/remux the uploaded file. Stream copy first, re-encode as fallback.

    Phone recordings arrive as `.mov` with an H.264/AAC pair; remuxing them
    into `.mp4` is cheap and makes the file playable in every browser.
    """
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        # Old images are built without ffmpeg; keep the full clip instead
        # of failing the whole upload.
        return source

    ext = source.suffix.lower()
    remux = ext not in {".mp4", ".webm"}
    trim = start is not None or end is not None
    if not remux and not trim:
        return source

    out_ext = ".mp4" if remux else ext
    out = source.with_name(f"{source.stem}.out{out_ext}")

    def command(reencode: bool) -> list[str]:
        cmd = [ffmpeg, "-y", "-loglevel", "error"]
        if start is not None:
            cmd += ["-ss", f"{max(start, 0):.3f}"]
        cmd += ["-i", str(source)]
        if end is not None:
            begin = max(start or 0, 0)
            cmd += ["-t", f"{max(end - begin, 0.1):.3f}"]
        if reencode:
            cmd += ["-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac"]
        else:
            cmd += ["-c", "copy"]
        if out_ext == ".mp4":
            cmd += ["-movflags", "+faststart"]
        cmd.append(str(out))
        return cmd

    async def run(cmd: list[str]) -> int:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        return proc.returncode

    code = await run(command(reencode=False))
    if code != 0:
        out.unlink(missing_ok=True)
        # A container/bitrate the muxer refuses to copy: re-encode once.
        code = await run(command(reencode=True))

    if code != 0 or not out.exists() or out.stat().st_size == 0:
        out.unlink(missing_ok=True)
        raise HTTPException(400, "Не удалось обработать видео")
    source.unlink(missing_ok=True)
    return out


@router.post("/media")
async def upload_media(
    file: UploadFile = File(...),
    start: Optional[float] = Form(None),
    end: Optional[float] = Form(None),
    folder: str = Form(DEFAULT_FOLDER),
    current_user: User = Depends(get_current_user),
):
    ext = Path(file.filename or "").suffix.lower()
    # Some clients (drag-and-drop from Finder/Explorer, certain Android
    # pickers) send an empty or generic MIME type. Trust a known video
    # extension instead of rejecting a perfectly good file.
    if (
        file.content_type not in ALLOWED_VIDEO_TYPES
        and ext not in ALLOWED_VIDEO_EXTS
    ):
        raise HTTPException(400, f"Unsupported content type: {file.content_type}")

    if ext not in ALLOWED_VIDEO_EXTS:
        ext = ".mp4" if file.content_type == "video/mp4" else ".webm"

    subdir = _folder(folder)
    target_dir = STORAGE_ROOT / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    target = target_dir / name
    size = 0
    try:
        with target.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_BYTES:
                    raise HTTPException(413, "File too large (max 100 MB)")
                out.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise
    if size == 0:
        target.unlink(missing_ok=True)
        raise HTTPException(400, "Empty file")

    trimmed = start is not None or end is not None
    if start is not None and start < 0:
        start = 0
    if end is not None and start is not None and end <= start:
        target.unlink(missing_ok=True)
        raise HTTPException(400, "Некорректный интервал обрезки")
    # Always call this: it is a no-op for a plain mp4/webm, but remuxes
    # phone .mov/.m4v clips into mp4 even when the user did not trim.
    try:
        target = await _trim_video(target, start, end)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise

    return {
        "url": f"/order_files/{subdir}/{target.name}",
        "poster_url": None,
        "trimmed": trimmed,
    }
