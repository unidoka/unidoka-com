import { $fetch } from "@/utils/fetch";

export interface ArticleTag {
  title: string;
  href?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_json: any | null;
  cover_image_src: string | null;
  cover_video_src: string | null;
  category: string | null;
  tags: ArticleTag[];
  author_name: string | null;
  author_avatar_url: string | null;
  is_team_author: boolean;
  seo_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticlePayload {
  title: string;
  slug?: string;
  description?: string | null;
  content_json?: any | null;
  cover_image_src?: string | null;
  cover_video_src?: string | null;
  category?: string | null;
  tags?: ArticleTag[];
  author_name?: string | null;
  author_avatar_url?: string | null;
  is_team_author?: boolean;
  seo_title?: string | null;
  meta_description?: string | null;
  is_featured?: boolean;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
  published_at?: string | null;
}

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

/* ── Admin ──────────────────────────────────────────────────────── */
export async function fetchAdminArticles(params?: {
  q?: string;
  status?: string;
}): Promise<Article[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  const res = await $fetch(
    `/api/v1/admin/articles${qs.toString() ? `?${qs}` : ""}`,
    { isToast: false },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to load articles");
  }
  return Array.isArray(res.json) ? (res.json as Article[]) : [];
}

export async function fetchAdminArticle(slug: string): Promise<Article | null> {
  const res = await $fetch(`/api/v1/admin/articles/${encodeURIComponent(slug)}`, {
    isToast: false,
  });
  if (!res?.response?.ok) return null;
  return res.json as Article;
}

export async function createArticle(payload: ArticlePayload): Promise<Article> {
  const res = await $fetch("/api/v1/admin/articles", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    if (Array.isArray(detail)) {
      const msgs = detail.map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      });
      throw new Error(msgs.join("; "));
    }
    throw new Error(typeof detail === "string" ? detail : "Failed to create");
  }
  return res.json as Article;
}

export async function updateArticle(
  slug: string,
  payload: Partial<ArticlePayload>,
): Promise<Article> {
  const res = await $fetch(`/api/v1/admin/articles/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    if (Array.isArray(detail)) {
      const msgs = detail.map((e: any) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      });
      throw new Error(msgs.join("; "));
    }
    throw new Error(typeof detail === "string" ? detail : "Failed to update");
  }
  return res.json as Article;
}

export async function deleteArticle(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/articles/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete");
}

/* ── Public (server-side for RSC) ───────────────────────────────── */
export async function fetchPublicArticlesServer(params?: {
  featured?: boolean;
  limit?: number;
}): Promise<Article[]> {
  const qs = new URLSearchParams();
  if (params?.featured) qs.set("featured", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/articles${qs.toString() ? `?${qs}` : ""}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? body : [];
  } catch {
    return [];
  }
}

export async function fetchPublicArticleServer(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/articles/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as Article;
  } catch {
    return null;
  }
}

export async function fetchPublicArticlesClient(): Promise<Article[]> {
  const res = await $fetch("/api/v1/articles", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Article[]) : [];
}
