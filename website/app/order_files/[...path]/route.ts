import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

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
};

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  for (const dir of CANDIDATE_DIRS) {
    const resolved = path.resolve(dir, ...segments);
    if (resolved !== dir && !resolved.startsWith(dir + path.sep)) continue;
    try {
      const buf = await readFile(resolved);
      const ext = path.extname(resolved).toLowerCase();
      return new Response(new Uint8Array(buf), {
        status: 200,
        headers: {
          "content-type": MIME[ext] || "application/octet-stream",
          "content-length": String(buf.byteLength),
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // not in this candidate dir, try the next
    }
  }
  return new Response("Not found", { status: 404 });
}
