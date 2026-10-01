import { $fetch } from "@/utils/fetch";
export interface StackItem {
  id: string;
  name: string;
  slug: string;
  icon_url?: string | null;
  usage_count: number;
}
export async function fetchStack(q?: string, limit = 300): Promise<StackItem[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("limit", String(limit));
  const res = await $fetch(`/api/v1/stack?${qs.toString()}`, { isToast: false });
  if (!Array.isArray(res?.json)) return [];
  return res.json as StackItem[];
}
export async function createStackItem(name: string): Promise<StackItem> {
  const res = await $fetch("/api/v1/stack", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create stack item");
  return res.json as StackItem;
}
