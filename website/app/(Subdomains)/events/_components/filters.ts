import type { EventItem, EventType } from "../_data/events";

export interface FilterState {
  organizers: string[];
  types: EventType[];
  country: string;      // "" = all
  ageMin: number;       // effective user age filter (inclusive)
  ageMax: number;       // inclusive
  registrationOpenOnly: boolean;
}

export const DEFAULT_AGE_MIN = 14;
export const DEFAULT_AGE_MAX = 60;

export const EMPTY_FILTER: FilterState = {
  organizers: [],
  types: [],
  country: "",
  ageMin: DEFAULT_AGE_MIN,
  ageMax: DEFAULT_AGE_MAX,
  registrationOpenOnly: false,
};

export function isFilterEmpty(f: FilterState): boolean {
  return (
    f.organizers.length === 0 &&
    f.types.length === 0 &&
    f.country === "" &&
    f.ageMin === DEFAULT_AGE_MIN &&
    f.ageMax === DEFAULT_AGE_MAX &&
    !f.registrationOpenOnly
  );
}

export function applyFilters(events: EventItem[], f: FilterState): EventItem[] {
  return events.filter((e) => {
    if (f.organizers.length && !f.organizers.includes(e.organizer)) return false;
    if (f.types.length && !f.types.includes(e.type)) return false;
    if (f.country && e.country !== f.country) return false;

    // Age overlap: the event's [ageMin, ageMax] must intersect the user's.
    const eMin = e.ageMin ?? 0;
    const eMax = e.ageMax ?? 200;
    if (eMax < f.ageMin) return false;
    if (eMin > f.ageMax) return false;

    if (f.registrationOpenOnly && !e.registrationOpen) return false;

    return true;
  });
}

/** Unique countries present in a list, sorted. */
export function uniqueCountries(events: EventItem[]): string[] {
  return [...new Set(events.map((e) => e.country))].sort();
}

/** Unique organizers present in a list, sorted by frequency desc. */
export function uniqueOrganizers(events: EventItem[]): string[] {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.organizer, (counts.get(e.organizer) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
}
