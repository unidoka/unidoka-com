import type { EventListItem, EventsCategory } from "@/utils/api/events";

export interface FilterState {
  categories: EventsCategory[];
  cities: string[];
  tagIds: string[];
  hasRegistrationOnly: boolean;
}

export const EMPTY_FILTER: FilterState = {
  categories: [],
  cities: [],
  tagIds: [],
  hasRegistrationOnly: false,
};

interface SearchParamsLike {
  get(name: string): string | null;
  getAll(name: string): string[];
}

const CATEGORY_VALUES: EventsCategory[] = ["activities", "competitions"];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function filterFromSearchParams(params: SearchParamsLike): FilterState {
  const categories = params
    .getAll("category")
    .filter((value): value is EventsCategory =>
      CATEGORY_VALUES.includes(value as EventsCategory),
    );

  return {
    categories: unique(categories),
    cities: unique(params.getAll("city").filter(Boolean)),
    tagIds: unique(params.getAll("tag").filter(Boolean)),
    hasRegistrationOnly: params.get("registration") === "1",
  };
}

export function writeFilterToSearchParams(
  params: URLSearchParams,
  filter: FilterState,
): void {
  params.delete("category");
  params.delete("city");
  params.delete("tag");
  params.delete("registration");

  for (const category of filter.categories) params.append("category", category);
  for (const city of filter.cities) params.append("city", city);
  for (const tagId of filter.tagIds) params.append("tag", tagId);
  if (filter.hasRegistrationOnly) params.set("registration", "1");
}

function sameValues(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sorted = [...b].sort();
  return [...a].sort().every((value, index) => value === sorted[index]);
}

export function filtersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.hasRegistrationOnly === b.hasRegistrationOnly &&
    sameValues(a.categories, b.categories) &&
    sameValues(a.cities, b.cities) &&
    sameValues(a.tagIds, b.tagIds)
  );
}

export function isFilterEmpty(f: FilterState): boolean {
  return (
    f.categories.length === 0 &&
    f.cities.length === 0 &&
    f.tagIds.length === 0 &&
    !f.hasRegistrationOnly
  );
}

export function applyFilters(events: EventListItem[], f: FilterState): EventListItem[] {
  return events.filter((e) => {
    if (f.categories.length) {
      const eventCategories = e.categories ?? [];
      if (!eventCategories.some((category) => f.categories.includes(category))) {
        return false;
      }
    }
    if (f.cities.length) {
      if (!e.city || !f.cities.includes(e.city)) return false;
    }
    if (f.tagIds.length) {
      const eventTagIds = (e.tags ?? []).map((t) => t.id);
      if (!eventTagIds.some((id) => f.tagIds.includes(id))) return false;
    }
    if (f.hasRegistrationOnly && !e.registration_url) return false;
    return true;
  });
}

/** Tags present in the current event set, sorted by frequency desc. */
export function uniqueTags(events: EventListItem[]) {
  const seen = new Map<string, { id: string; name: string; count: number }>();
  for (const e of events) {
    const eventTagIds = new Set<string>();
    for (const tag of e.tags ?? []) {
      if (eventTagIds.has(tag.id)) continue;
      eventTagIds.add(tag.id);
      const cur = seen.get(tag.id);
      if (cur) cur.count++;
      else seen.set(tag.id, { id: tag.id, name: tag.name, count: 1 });
    }
  }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Cities present in the current event set, sorted by frequency desc. */
export function uniqueCities(events: EventListItem[]) {
  const seen = new Map<string, { name: string; count: number }>();
  for (const e of events) {
    const city = e.city?.trim();
    if (!city) continue;
    const cur = seen.get(city);
    if (cur) cur.count++;
    else seen.set(city, { name: city, count: 1 });
  }
  return [...seen.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
