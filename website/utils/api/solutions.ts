import { $fetch } from "@/utils/fetch";

export interface Solution {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  mdx_content: string | null;
  content_json: any | null;
  cover_image_src: string | null;
  cover_video_src: string | null;
  href: string | null;
  platform: string | null;
  category: string | null;
  period: string | null;
  tech_stack: string[];
  tags: Array<{ title: string; href?: string }>;
  client_id: string | null;
  client_name: string | null;
  custom_page: string | null;
  page: string | null;
  seo_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SolutionPayload {
  title: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  mdx_content?: string | null;
  content_json?: any | null;
  cover_image_src?: string | null;
  cover_video_src?: string | null;
  href?: string | null;
  platform?: string | null;
  category?: string | null;
  period?: string | null;
  tech_stack?: string[];
  tags?: Array<{ title: string; href?: string }>;
  client_id?: string | null;
  client_name?: string | null;
  custom_page?: string | null;
  page?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  is_featured?: boolean;
  status?: "draft" | "published" | "archived";
  sort_order?: number;
}

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

/* ── Admin ──────────────────────────────────────────────────────── */
export async function fetchAdminSolutions(params?: {
  q?: string;
  status?: string;
  page?: string;
}): Promise<Solution[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", params.page);
  const res = await $fetch(
    `/api/v1/admin/solutions${qs.toString() ? `?${qs}` : ""}`,
    { isToast: false },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to load solutions");
  }
  return Array.isArray(res.json) ? (res.json as Solution[]) : [];
}

export async function fetchAdminSolution(slug: string): Promise<Solution | null> {
  const res = await $fetch(`/api/v1/admin/solutions/${encodeURIComponent(slug)}`, {
    isToast: false,
  });
  if (!res?.response?.ok) return null;
  return res.json as Solution;
}

export async function createSolution(payload: SolutionPayload): Promise<Solution> {
  const res = await $fetch("/api/v1/admin/solutions", {
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
  return res.json as Solution;
}

export async function updateSolution(
  slug: string,
  payload: Partial<SolutionPayload>,
): Promise<Solution> {
  const res = await $fetch(`/api/v1/admin/solutions/${encodeURIComponent(slug)}`, {
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
  return res.json as Solution;
}

export async function deleteSolution(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/solutions/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete");
}

/* ── Public (server-side for RSC) ───────────────────────────────── */
export async function fetchPublicSolutionsServer(params?: {
  featured?: boolean;
  limit?: number;
  page?: string;
}): Promise<Solution[]> {
  const qs = new URLSearchParams();
  if (params?.featured) qs.set("featured", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.page) qs.set("page", params.page);
  try {
    const url = `${API_BASE}/api/v1/solutions${qs.toString() ? `?${qs}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("[solutions] public list failed", res.status, url);
      return [];
    }
    const body = await res.json();
    return Array.isArray(body) ? body : [];
  } catch (error) {
    console.error("[solutions] public list unreachable", API_BASE, error);
    return [];
  }
}

export async function fetchPublicSolutionServer(slug: string): Promise<Solution | null> {
  try {
    const url = `${API_BASE}/api/v1/solutions/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("[solutions] public detail failed", res.status, url);
      return null;
    }
    return (await res.json()) as Solution;
  } catch (error) {
    console.error("[solutions] public detail unreachable", API_BASE, error);
    return null;
  }
}

export async function fetchPublicSolutionsClient(page?: string): Promise<Solution[]> {
  const qs = page ? `?page=${encodeURIComponent(page)}` : "";
  const res = await $fetch(`/api/v1/solutions${qs}`, { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Solution[]) : [];
}

export async function fetchPublicSolutionClient(slug: string): Promise<Solution | null> {
  const res = await $fetch(`/api/v1/solutions/${encodeURIComponent(slug)}`, {
    isToast: false,
  });
  if (!res?.response?.ok) return null;
  return (res.json as Solution) ?? null;
}
