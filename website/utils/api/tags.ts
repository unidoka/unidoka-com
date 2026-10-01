import { $fetch } from "@/utils/fetch";
export type TagKind = "tag" | "category" | "brand";
export interface Tag {
  id: string;
  name: string;
  slug: string;
  kind: TagKind;
  usage_count: number;
}
export async function fetchTags(q?: string, limit = 200, kind?: TagKind): Promise<Tag[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (kind) qs.set("kind", kind);
  qs.set("limit", String(limit));
  const res = await $fetch(`/api/v1/tags?${qs.toString()}`, { isToast: false });
  return (res?.json as Tag[]) || [];
}
export async function createTag(name: string, kind: TagKind = "tag"): Promise<Tag> {
  const res = await $fetch("/api/v1/tags", {
    method: "POST",
    body: JSON.stringify({ name, kind }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create tag");
  return res.json as Tag;
}
