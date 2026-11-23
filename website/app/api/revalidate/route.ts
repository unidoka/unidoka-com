import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Tag-based cache invalidation for admin writes.
 *
 * Editors save on a different subdomain but are served by the same
 * Next.js process, so the request lands in the same ISR cache. Keep
 * the accepted tag list closed - a free-form tag would let anyone
 * flush unrelated caches.
 */
const ALLOWED_PREFIXES = ["solutions", "solution:", "articles", "article:", "events", "event:"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ revalidated: false, reason: "invalid_json" }, { status: 400 });
  }

  const raw = (body as { tags?: unknown })?.tags;
  const tags = Array.isArray(raw)
    ? raw.filter(
        (tag): tag is string =>
          typeof tag === "string" &&
          ALLOWED_PREFIXES.some((prefix) => tag === prefix || tag.startsWith(prefix)),
      )
    : [];

  if (tags.length === 0) {
    return NextResponse.json({ revalidated: false, reason: "no_valid_tags" }, { status: 400 });
  }

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: true, tags });
}
