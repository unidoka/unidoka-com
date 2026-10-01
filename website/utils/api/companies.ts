import { $fetch } from "@/utils/fetch";
export interface ClientListItem {
  id: string; slug: string; name: string;
  website?: string | null; logotype_url?: string | null;
  industry?: string | null; project_count: number;
}
export interface ClientProjectRef {
  id: string; slug: string; title: string;
  short_description?: string | null;
  cover_image_src: string; cover_video_src?: string | null;
  period?: string | null; is_featured: boolean;
}
export interface ClientDetail {
  id: string; slug: string; name: string;
  website?: string | null; logotype_url?: string | null;
  industry?: string | null; description?: string | null;
  lifecycle_stage?: string | null;
  projects: ClientProjectRef[];
}
const API_BASE = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export async function fetchClientsServer(): Promise<ClientListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/companies`, { next: { revalidate: 300 } } as any);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
export async function fetchClientServer(slug: string): Promise<ClientDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/companies/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } } as any);
    if (!res.ok) return null;
    return (await res.json()) as ClientDetail;
  } catch { return null; }
}
export async function fetchCompanies(): Promise<ClientListItem[]> {
  const res = await $fetch("/api/v1/admin/companies", { isToast: false });
  if (!Array.isArray(res?.json)) return [];
  return res.json.map((c: any) => ({
    id: c.id, slug: c.slug, name: c.name,
    website: c.website, logotype_url: c.logotype_url,
    industry: c.industry, project_count: 0,
  }));
}
export interface ClientCreatePayload {
  name: string; slug?: string;
  website?: string | null; logotype_url?: string | null;
  industry?: string | null; description?: string | null;
  lifecycle_stage?: string | null;
}
export async function createCompany(payload: ClientCreatePayload): Promise<ClientListItem> {
  const res = await $fetch("/api/v1/admin/companies", {
    method: "POST", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create client");
  const c = res.json;
  return { id: c.id, slug: c.slug, name: c.name, website: c.website, logotype_url: c.logotype_url, industry: c.industry, project_count: 0 };
}
export async function updateCompany(id: string, payload: Partial<ClientCreatePayload>): Promise<ClientListItem> {
  const res = await $fetch(`/api/v1/admin/companies/${id}`, {
    method: "PATCH", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update client");
  const c = res.json;
  return { id: c.id, slug: c.slug, name: c.name, website: c.website, logotype_url: c.logotype_url, industry: c.industry, project_count: 0 };
}
export async function deleteCompany(id: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/companies/${id}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete client");
}
