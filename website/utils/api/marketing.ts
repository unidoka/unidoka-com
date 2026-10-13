import { $fetch } from "@/utils/fetch";

export type PlacementType = "top" | "card" | "toast" | "dialog";
export type ActionVariant = "primary" | "outlined" | "text";

export interface PlacementAction {
  label: string;
  url: string;
  variant: ActionVariant;
}

export interface MarketingPlacement {
  id: string;
  slug: string;
  title: string;
  placement_type: PlacementType;
  page: string;
  heading: string | null;
  body: string | null;
  image_url: string | null;
  actions: PlacementAction[];
  accent_color: string | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PlacementPayload {
  title: string;
  slug?: string;
  placement_type: PlacementType;
  page: string;
  heading?: string | null;
  body?: string | null;
  image_url?: string | null;
  actions?: PlacementAction[];
  accent_color?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  priority: number;
}

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

/* ── Admin ──────────────────────────────────────────────────────── */

export async function fetchAdminPlacements(params?: {
  q?: string;
  page?: string;
  placement_type?: string;
  active_only?: boolean;
}): Promise<MarketingPlacement[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.page) qs.set("page", params.page);
  if (params?.placement_type) qs.set("placement_type", params.placement_type);
  if (params?.active_only) qs.set("active_only", "true");
  const res = await $fetch(
    `/api/v1/admin/marketing/placements${qs.toString() ? `?${qs}` : ""}`,
    { isToast: false },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to load placements");
  }
  return Array.isArray(res.json) ? (res.json as MarketingPlacement[]) : [];
}

export async function fetchAdminPlacement(
  slug: string,
): Promise<MarketingPlacement | null> {
  const res = await $fetch(
    `/api/v1/admin/marketing/placements/${encodeURIComponent(slug)}`,
    { isToast: false },
  );
  if (!res?.response?.ok) return null;
  return res.json as MarketingPlacement;
}

export async function createPlacement(
  payload: PlacementPayload,
): Promise<MarketingPlacement> {
  const res = await $fetch("/api/v1/admin/marketing/placements", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
    throw new Error(msg || "Failed to create placement");
  }
  return res.json as MarketingPlacement;
}

export async function updatePlacement(
  slug: string,
  payload: Partial<PlacementPayload>,
): Promise<MarketingPlacement> {
  const res = await $fetch(
    `/api/v1/admin/marketing/placements/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
    throw new Error(msg || "Failed to update placement");
  }
  return res.json as MarketingPlacement;
}

export async function deletePlacement(slug: string): Promise<void> {
  const res = await $fetch(
    `/api/v1/admin/marketing/placements/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to delete placement");
  }
}

/* ── Public (server-side, for RSC) ──────────────────────────────── */

export async function fetchActivePlacements(
  page: string,
  type?: PlacementType,
): Promise<MarketingPlacement[]> {
  const qs = new URLSearchParams({ page });
  if (type) qs.set("placement_type", type);
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/marketing/placements?${qs.toString()}`,
      { next: { revalidate: 30, tags: ["placements"] } } as any,
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? body : [];
  } catch {
    return [];
  }
}
