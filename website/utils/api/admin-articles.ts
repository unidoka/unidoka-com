import { $fetch } from "@/utils/fetch";
import type { TagRef } from "@/utils/api/articles";
export type ReviewStatus = "draft" | "pending_review" | "published" | "rejected";
export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  publication_status: ReviewStatus | string;
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: { id: string; name?: string | null; username?: string | null } | null;
  author_id?: string | null;
  author?: {
    id: string;
    name?: string | null;
    surname?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } | null;
  tags?: TagRef[] | null;
  is_team_author: boolean;
  is_pending: boolean;
  created_at: string;
  updated_at: string;
}
export interface AdminArticleFilters {
  status?: ReviewStatus | null;
  authorType?: "team" | "external" | null;
  q?: string;
}
export async function fetchAdminArticles(filters: AdminArticleFilters = {}): Promise<AdminArticle[]> {
  const qs = new URLSearchParams();
  if (filters.status) qs.set("status", filters.status);
  if (filters.authorType) qs.set("author_type", filters.authorType);
  if (filters.q) qs.set("q", filters.q);
  const url = `/api/v1/admin/articles${qs.toString() ? `?${qs}` : ""}`;
  const res = await $fetch(url, { isToast: false });
  if (res?.response?.status === 401) throw new Error("Session expired. Please sign in again.");
  if (!res?.response?.ok) throw new Error(res?.json?.detail || `Request failed (${res?.response?.status ?? "network"})`);
  if (!Array.isArray(res.json)) throw new Error("Unexpected response from server.");
  return res.json as AdminArticle[];
}
export async function approveArticle(slug: string): Promise<AdminArticle> {
  const res = await $fetch(`/api/v1/admin/articles/${encodeURIComponent(slug)}/approve`, { method: "PATCH" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to approve");
  return res.json as AdminArticle;
}
export async function rejectArticle(slug: string, note: string): Promise<AdminArticle> {
  const res = await $fetch(`/api/v1/admin/articles/${encodeURIComponent(slug)}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to reject");
  return res.json as AdminArticle;
}
