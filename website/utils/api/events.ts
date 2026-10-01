import { $fetch } from "@/utils/fetch";
export interface EventListItem {
  id: string; slug: string; title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  start_at?: string | null; end_at?: string | null;
  location_name?: string | null; city?: string | null;
  price?: string | null; capacity?: number | null;
  registration_url?: string | null;
  is_featured: boolean; publication_status: string;
  custom_page?: string | null;
  created_at: string; updated_at: string;
  tags?: { id: string; name: string; slug: string; kind: string }[];
}
export interface EventDetail extends EventListItem {
  description?: string | null; address?: string | null; metro?: string | null;
  mdx_content?: string | null; seo_title?: string | null; meta_description?: string | null;
}
export interface EventPayload {
  slug?: string; title: string;
  short_description?: string; description?: string;
  cover_image_src?: string; cover_video_src?: string;
  start_at?: string | null; end_at?: string | null;
  location_name?: string | null; address?: string | null; metro?: string | null;
  city?: string | null; price?: string | null;
  registration_url?: string | null; capacity?: number | null;
  custom_page?: string | null; is_featured?: boolean;
  publication_status?: "draft" | "published";
  mdx_content?: string; seo_title?: string | null; meta_description?: string | null;
  tags?: string[];
}
const SERVER_API_BASE = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export async function fetchPublishedEventsServer(params?: { upcomingOnly?: boolean; limit?: number }): Promise<EventListItem[]> {
  const qs = new URLSearchParams();
  if (params?.upcomingOnly) qs.set("upcoming_only", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  try {
    const res = await fetch(`${SERVER_API_BASE}/api/v1/events${qs.toString() ? `?${qs}` : ""}`, { next: { revalidate: 60, tags: ["events"] } } as any);
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? body : [];
  } catch { return []; }
}
export async function fetchEventServer(slug: string): Promise<EventDetail | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE}/api/v1/events/${encodeURIComponent(slug)}`, { next: { revalidate: 60, tags: ["events"] } } as any);
    if (!res.ok) return null;
    return (await res.json()) as EventDetail;
  } catch { return null; }
}
export async function fetchAdminEvents(params?: { q?: string; status?: string }): Promise<EventListItem[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  const res = await $fetch(`/api/v1/admin/events${qs.toString() ? `?${qs}` : ""}`, { isToast: false });
  return Array.isArray(res?.json) ? (res.json as EventListItem[]) : [];
}
export async function fetchAdminEvent(slug: string): Promise<EventDetail | null> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, { isToast: false });
  if (!res?.response?.ok) return null;
  return res.json as EventDetail;
}
export async function createEvent(payload: EventPayload): Promise<EventDetail> {
  const res = await $fetch("/api/v1/admin/events", {
    method: "POST", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create event");
  return res.json as EventDetail;
}
export async function updateEvent(slug: string, payload: Partial<EventPayload>): Promise<EventDetail> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, {
    method: "PATCH", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update event");
  return res.json as EventDetail;
}
export async function deleteEvent(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/events/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete event");
}
export interface EventRegistrationPayload {
  name?: string; surname?: string; patronymic?: string;
  phone?: string; email?: string; telegram_username?: string;
  age?: number; meta?: Record<string, unknown>;
}
export async function registerForEvent(slug: string, payload: EventRegistrationPayload): Promise<{ id: string; status: string }> {
  const res = await $fetch(`/api/v1/events/${encodeURIComponent(slug)}/register`, {
    method: "POST", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Registration failed");
  return res.json;
}
export interface EventRequestRow {
  id: string; event_id: string;
  event_slug?: string | null; event_title?: string | null;
  name?: string | null; surname?: string | null; patronymic?: string | null;
  phone?: string | null; email?: string | null; telegram_username?: string | null;
  age?: number | null; status: string; decline_reason?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string; updated_at: string;
}
export async function fetchAllEventRequests(params?: { eventSlug?: string; status?: string; q?: string }): Promise<EventRequestRow[]> {
  const qs = new URLSearchParams();
  if (params?.eventSlug) qs.set("event_slug", params.eventSlug);
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const res = await $fetch(`/api/v1/admin/event-requests${qs.toString() ? `?${qs}` : ""}`, { isToast: false });
  return Array.isArray(res?.json) ? (res.json as EventRequestRow[]) : [];
}
export async function updateEventRequest(id: string, payload: { status: string; decline_reason?: string | null }): Promise<EventRequestRow> {
  const res = await $fetch(`/api/v1/admin/events/requests/${id}`, {
    method: "PATCH", body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update");
  return res.json as EventRequestRow;
}
