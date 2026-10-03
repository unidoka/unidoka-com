import { $fetch } from "@/utils/fetch";

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  avatar_url: string | null;
  owner_id: string | null;
  description: string | null;
  is_active: boolean;
}

export interface EventTypeTaxonomy {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Subdirection {
  id: string;
  direction_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface Direction extends EventTypeTaxonomy {
  emoji: string | null;
  subdirections: Subdirection[];
}

/* ── Public meta (unauthenticated) ─────────────────────────────── */
export async function fetchOrganizersPublic(): Promise<Organizer[]> {
  const res = await $fetch("/api/v1/events/meta/organizers", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

export async function fetchEventTypesPublic(): Promise<EventTypeTaxonomy[]> {
  const res = await $fetch("/api/v1/events/meta/types", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

export async function fetchDirectionsPublic(): Promise<Direction[]> {
  const res = await $fetch("/api/v1/events/meta/directions", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

/* ── Admin CRUD ────────────────────────────────────────────────── */
async function adminCall<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await $fetch(path, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Request failed");
  }
  return res.json as T;
}

// Organizers
export const adminListOrganizers = () =>
  adminCall<Organizer[]>("/api/v1/admin/organizers", "GET");
export const adminCreateOrganizer = (p: Partial<Organizer>) =>
  adminCall<Organizer>("/api/v1/admin/organizers", "POST", p);
export const adminUpdateOrganizer = (id: string, p: Partial<Organizer>) =>
  adminCall<Organizer>(`/api/v1/admin/organizers/${id}`, "PATCH", p);
export const adminDeleteOrganizer = (id: string) =>
  adminCall<void>(`/api/v1/admin/organizers/${id}`, "DELETE");

// Types
export const adminListTypes = () =>
  adminCall<EventTypeTaxonomy[]>("/api/v1/admin/event-types", "GET");
export const adminCreateType = (p: Partial<EventTypeTaxonomy>) =>
  adminCall<EventTypeTaxonomy>("/api/v1/admin/event-types", "POST", p);
export const adminUpdateType = (id: string, p: Partial<EventTypeTaxonomy>) =>
  adminCall<EventTypeTaxonomy>(`/api/v1/admin/event-types/${id}`, "PATCH", p);
export const adminDeleteType = (id: string) =>
  adminCall<void>(`/api/v1/admin/event-types/${id}`, "DELETE");

// Directions
export const adminListDirections = () =>
  adminCall<Direction[]>("/api/v1/admin/directions", "GET");
export const adminCreateDirection = (p: Partial<Direction>) =>
  adminCall<Direction>("/api/v1/admin/directions", "POST", p);
export const adminUpdateDirection = (id: string, p: Partial<Direction>) =>
  adminCall<Direction>(`/api/v1/admin/directions/${id}`, "PATCH", p);
export const adminDeleteDirection = (id: string) =>
  adminCall<void>(`/api/v1/admin/directions/${id}`, "DELETE");

// Subdirections
export const adminCreateSubdirection = (
  directionId: string,
  p: Partial<Subdirection>,
) =>
  adminCall<Subdirection>(
    `/api/v1/admin/directions/${directionId}/subdirections`,
    "POST",
    p,
  );
export const adminUpdateSubdirection = (id: string, p: Partial<Subdirection>) =>
  adminCall<Subdirection>(`/api/v1/admin/subdirections/${id}`, "PATCH", p);
export const adminDeleteSubdirection = (id: string) =>
  adminCall<void>(`/api/v1/admin/subdirections/${id}`, "DELETE");
