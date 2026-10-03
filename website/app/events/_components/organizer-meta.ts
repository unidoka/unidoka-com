import type { OrganizerRef } from "@/utils/api/events";

/* Fallback palette for organizers that have no `color` set in the DB.
   Matches the neutral house style — muted, not decorative. */
const FALLBACK = ["#4a4e54", "#6b6f75", "#2b2e33", "#8a8e93"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Resolve a display color for an organizer. Prefers the DB `color` column
 * (set by admins in the organizers panel); falls back to a stable hash of
 * the slug so an organizer never flickers between shades.
 */
export function colorForOrganizer(
  org: Pick<OrganizerRef, "slug" | "color"> | null | undefined,
): string {
  if (!org) return FALLBACK[0];
  if (org.color && /^#[0-9a-f]{3,8}$/i.test(org.color)) return org.color;
  return FALLBACK[hash(org.slug) % FALLBACK.length];
}

/** Small helper for components that only have an organizer name string. */
export function colorForOrganizerName(name: string): string {
  return FALLBACK[hash(name) % FALLBACK.length];
}
