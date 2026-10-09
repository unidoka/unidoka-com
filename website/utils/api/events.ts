import { $fetch } from "@/utils/fetch";

/**
 * Разбирает ответ FastAPI (особенно 422 Validation Error) в читаемую строку.
 * FastAPI возвращает { detail: [ { loc: ["body", "start_at"], msg: "field required" } ] }
 * Без этого мы получаем [object Object].
 */
function extractErrorMessage(payload: any, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;

  const detail = payload.detail ?? payload.message;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => {
        if (typeof e === "string") return e;
        if (e && typeof e === "object") {
          const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : "";
          const msg = e.msg || e.message || JSON.stringify(e);
          return field ? `${field}: ${msg}` : msg;
        }
        return String(e);
      })
      .filter(Boolean)
      .join("; ");
  }

  if (typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  return fallback;
}

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
  registration_deadline?: string | null;
  other_dates?: Array<{ label: string; at: string }>;
  location_name?: string | null;
  address?: string | null;
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
  custom_organizer_name?: string | null;
  types?: TypeAssignment[];
  tags?: SubdirectionRef[];
  submitted_by?: EventAuthor | null;
  submitted_by_id?: string | null;
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
  reviewed_by_id?: string | null;
  reviewed_at?: string | null;
}

export interface EventTypeInput {
  type_id?: string | null;
  custom_name?: string | null;
}

export interface OtherDateInput {
  label: string;
  at: string;
}

export interface EventPayload {
  title: string;
  start_at: string;  // required
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  cover_image_src?: string | null;
  cover_video_src?: string | null;
  href?: string | null;
  end_at?: string | null;
  registration_deadline?: string | null;
  other_dates?: OtherDateInput[];
  location_name?: string | null;
  address?: string | null;
  metro?: string | null;
  city?: string | null;
  price?: string | null;
  capacity?: number | null;
  registration_url?: string | null;
  organizer_id?: string | null;
  custom_organizer_name?: string | null;
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
    throw new Error(extractErrorMessage(res?.json, "Не удалось отправить событие"));
  }
  return res.json as EventDetail;
}

/* ── Admin CRUD ────────────────────────────────────────────────── */
export async function fetchAdminEvents(params?: {
  q?: string;
  status?: string;
  organizer_id?: string;
  event_type_id?: string;
}): Promise<EventListItem[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.organizer_id) qs.set("organizer_id", params.organizer_id);
  if (params?.event_type_id) qs.set("event_type_id", params.event_type_id);
  const res = await $fetch(
    `/api/v1/admin/events${qs.toString() ? `?${qs}` : ""}`,
    { isToast: false },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to fetch events");
  }
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
  if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json, "Failed to create event"));
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
  if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json, "Failed to update event"));
  return res.json as EventDetail;
}

export async function deleteEvent(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json, "Failed to delete event"));
}

export async function approveEvent(slug: string): Promise<EventDetail> {
  const res = await $fetch(
    `/api/v1/admin/events/${encodeURIComponent(slug)}/approve`,
    { method: "POST" },
  );
  if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json, "Failed to approve"));
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
  if (!res?.response?.ok) throw new Error(extractErrorMessage(res?.json, "Failed to reject"));
  return res.json as EventDetail;
}
