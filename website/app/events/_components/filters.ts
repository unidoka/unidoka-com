import type { EventListItem } from "@/utils/api/events";

export interface FilterState {
  organizerIds: string[];
  typeIds: string[];
  featuredOnly: boolean;
  hasRegistrationOnly: boolean;
}

export const EMPTY_FILTER: FilterState = {
  organizerIds: [],
  typeIds: [],
  featuredOnly: false,
  hasRegistrationOnly: false,
};

export function isFilterEmpty(f: FilterState): boolean {
  return (
    f.organizerIds.length === 0 &&
    f.typeIds.length === 0 &&
    !f.featuredOnly &&
    !f.hasRegistrationOnly
  );
}

export function applyFilters(events: EventListItem[], f: FilterState): EventListItem[] {
  return events.filter((e) => {
    if (f.organizerIds.length && (!e.organizer || !f.organizerIds.includes(e.organizer.id)))
      return false;
    if (f.typeIds.length) {
      const evTypeIds = (e.types ?? [])
        .map((t) => t.type?.id)
        .filter((id): id is string => !!id);
      if (!evTypeIds.some((id) => f.typeIds.includes(id))) return false;
    }
    if (f.featuredOnly && !e.is_featured) return false;
    if (f.hasRegistrationOnly && !e.registration_url) return false;
    return true;
  });
}

/** Organizers present in the current event set, sorted by frequency desc. */
export function uniqueOrganizers(events: EventListItem[]) {
  const seen = new Map<string, { id: string; name: string; slug: string; color: string | null; count: number }>();
  for (const e of events) {
    if (!e.organizer) continue;
    const cur = seen.get(e.organizer.id);
    if (cur) cur.count++;
    else
      seen.set(e.organizer.id, {
        id: e.organizer.id,
        name: e.organizer.name,
        slug: e.organizer.slug,
        color: e.organizer.color,
        count: 1,
      });
  }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Types present in the current event set. */
export function uniqueTypes(events: EventListItem[]) {
  const seen = new Map<string, { id: string; name: string; color: string | null; count: number }>();
  for (const e of events) {
    for (const a of e.types ?? []) {
      if (!a.type) continue;
      const cur = seen.get(a.type.id);
      if (cur) cur.count++;
      else
        seen.set(a.type.id, {
          id: a.type.id,
          name: a.type.name,
          color: a.type.color,
          count: 1,
        });
    }
  }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
