import { NextRequest } from "next/server";
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const CANDIDATE_DIRS: string[] = [
  process.env.ORDER_FILES_DIR ?? "",
  path.resolve(process.cwd(), "../backend/services/main-service/storage/order_files"),
  path.resolve(process.cwd(), "backend/services/main-service/storage/order_files"),
  path.resolve(process.cwd(), "public/order_files"),
  path.resolve(process.cwd(), "order_files"),
].filter((d) => d.length > 0);

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
};

export const dynamic = "force-dynamic";

/**
 * Browsers fetch <video> with `Range: bytes=...`; answering 200 with the whole
 * body (and no Accept-Ranges) leaves the player stuck on a black frame in
 * Safari and often in Chrome. Uploaded videos are therefore streamed with
 * 206 Partial Content, the same way a static file server would.
 */
function parseRange(header: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;

  let start: number;
  let end: number;
  if (rawStart === "") {
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Number(rawEnd);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start > end || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  for (const candidate of CANDIDATE_DIRS) {
    // Resolve the root too: a relative ORDER_FILES_DIR would otherwise
    // never match the absolute `resolved` path, and a `..` sneaking past
    // the prefix check is the classic path traversal.
    const dir = path.resolve(candidate);
    const resolved = path.resolve(dir, ...segments);
    if (resolved !== dir && !resolved.startsWith(dir + path.sep)) continue;

    let size: number;
    try {
      const info = await stat(resolved);
      if (!info.isFile()) continue;
      size = info.size;
    } catch {
      // not in this candidate dir, try the next
      continue;
    }

    const ext = path.extname(resolved).toLowerCase();
    const headers: Record<string, string> = {
      "content-type": MIME[ext] || "application/octet-stream",
      "accept-ranges": "bytes",
      "cache-control": "public, max-age=31536000, immutable",
      // User-uploaded bytes: never let the browser re-interpret them
      // as HTML/JS if the extension lies about the content type.
      "x-content-type-options": "nosniff",
    };

    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      const range = parseRange(rangeHeader, size);
      if (!range) {
        return new Response(null, {
          status: 416,
          headers: { "content-range": `bytes */${size}` },
        });
      }
      const handle = await open(resolved, "r");
      const stream = handle.createReadStream({
        start: range.start,
        end: range.end,
      });
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          ...headers,
          "content-range": `bytes ${range.start}-${range.end}/${size}`,
          "content-length": String(range.end - range.start + 1),
        },
      });
    }

    const handle = await open(resolved, "r");
    return new Response(Readable.toWeb(handle.createReadStream()) as ReadableStream, {
      status: 200,
      headers: { ...headers, "content-length": String(size) },
    });
  }
  return new Response("Not found", { status: 404 });
}
