import { $fetch } from "@/utils/fetch";

export interface OrganizerRef {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  is_active: boolean;
}

export interface SubdirectionRef {
  id: string;
  direction_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface TypeAssignment {
  id: string;
  type_id: string | null;
  custom_name: string | null;
  type: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: boolean;
  } | null;
}

export interface EventAuthor {
  id: string;
  name: string | null;
  surname: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location_name?: string | null;
  city?: string | null;
  price?: string | null;
  capacity?: number | null;
  registration_url?: string | null;
  is_featured: boolean;
  status: "pending" | "approved" | "rejected";
  custom_page?: string | null;
  created_at: string;
  updated_at: string;
  organizer?: OrganizerRef | null;
  types?: TypeAssignment[];
  tags?: SubdirectionRef[];
}

export interface EventDetail extends EventListItem {
  description?: string | null;
  address?: string | null;
  metro?: string | null;
  href?: string | null;
  mdx_content?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  rejection_reason?: string | null;
  submitted_by?: EventAuthor | null;
  submitted_by_id?: string | null;
  reviewed_by_id?: string | null;
  reviewed_at?: string | null;
}

export interface EventTypeInput {
  type_id?: string | null;
  custom_name?: string | null;
}

export interface EventPayload {
  title: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  cover_image_src?: string | null;
  cover_video_src?: string | null;
  href?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location_name?: string | null;
  address?: string | null;
  metro?: string | null;
  city?: string | null;
  price?: string | null;
  capacity?: number | null;
  registration_url?: string | null;
  organizer_id?: string | null;
  types?: EventTypeInput[];
  subdirection_ids?: string[];
  // Admin only
  custom_page?: string | null;
  is_featured?: boolean;
  seo_title?: string | null;
  meta_description?: string | null;
  mdx_content?: string | null;
  status?: "pending" | "approved" | "rejected";
}

const SERVER_API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

/* ── Server-side fetchers (RSC) ────────────────────────────────── */
export async function fetchPublishedEventsServer(params?: {
  upcomingOnly?: boolean;
  limit?: number;
}): Promise<EventListItem[]> {
  const qs = new URLSearchParams();
  if (params?.upcomingOnly) qs.set("upcoming_only", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  try {
    const res = await fetch(
      `${SERVER_API_BASE}/api/v1/events${qs.toString() ? `?${qs}` : ""}`,
      { next: { revalidate: 60, tags: ["events"] } } as any,
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? body : [];
  } catch {
    return [];
  }
}

export async function fetchEventServer(slug: string): Promise<EventDetail | null> {
  try {
    const res = await fetch(
      `${SERVER_API_BASE}/api/v1/events/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60, tags: ["events"] } } as any,
    );
    if (!res.ok) return null;
    return (await res.json()) as EventDetail;
  } catch {
    return null;
  }
}

/* ── Client fetchers ───────────────────────────────────────────── */
export async function fetchPublishedEventsClient(): Promise<EventListItem[]> {
  const res = await $fetch("/api/v1/events", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

export async function fetchMyEventSubmissions(): Promise<EventListItem[]> {
  const res = await $fetch("/api/v1/events/me", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

/* ── User submission ───────────────────────────────────────────── */
export async function submitEvent(payload: EventPayload): Promise<EventDetail> {
  const res = await $fetch("/api/v1/events/submit", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Не удалось отправить событие");
  }
  return res.json as EventDetail;
}

/* ── Admin CRUD ────────────────────────────────────────────────── */
export async function fetchAdminEvents(params?: {
  q?: string;
  status?: string;
}): Promise<EventListItem[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  const res = await $fetch(
    `/api/v1/admin/events${qs.toString() ? `?${qs}` : ""}`,
    { isToast: false },
  );
  return Array.isArray(res?.json) ? res.json : [];
}

export async function fetchAdminEvent(slug: string): Promise<EventDetail | null> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, {
    isToast: false,
  });
  if (!res?.response?.ok) return null;
  return res.json as EventDetail;
}

export async function createEvent(payload: EventPayload): Promise<EventDetail> {
  const res = await $fetch("/api/v1/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create event");
  return res.json as EventDetail;
}

export async function updateEvent(
  slug: string,
  payload: Partial<EventPayload>,
): Promise<EventDetail> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update event");
  return res.json as EventDetail;
}

export async function deleteEvent(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete event");
}

export async function approveEvent(slug: string): Promise<EventDetail> {
  const res = await $fetch(
    `/api/v1/admin/events/${encodeURIComponent(slug)}/approve`,
    { method: "POST" },
  );
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to approve");
  return res.json as EventDetail;
}

export async function rejectEvent(slug: string, reason: string): Promise<EventDetail> {
  const res = await $fetch(
    `/api/v1/admin/events/${encodeURIComponent(slug)}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to reject");
  return res.json as EventDetail;
}
