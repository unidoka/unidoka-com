import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { EventItem } from "../_data/events";

export const WEEK_OPTS = { weekStartsOn: 1 as const };
export const KEY_FMT = "yyyy-MM-dd";

export function dateKey(d: Date): string {
  return format(d, KEY_FMT);
}

/**
 * Six weeks × seven days covering the month. Always 42 cells so the
 * grid height never jumps between months.
 */
export function monthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), WEEK_OPTS);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekGrid(anchor: Date): Date[] {
  const start = startOfWeek(anchor, WEEK_OPTS);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Multi-day events get expanded onto every date in their range, so
 * "Oct 5 – Oct 12" appears on all eight days. Keyed by yyyy-MM-dd.
 */
export function indexByDay(events: EventItem[]): Map<string, EventItem[]> {
  const map = new Map<string, EventItem[]>();
  for (const ev of events) {
    const start = startOfDay(new Date(ev.startsAt));
    const end = ev.endsAt ? startOfDay(new Date(ev.endsAt)) : start;
    let cursor = start;
    // Guard against malformed ranges (end < start).
    let safety = 0;
    while (cursor <= end && safety < 400) {
      const key = format(cursor, KEY_FMT);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
      cursor = addDays(cursor, 1);
      safety++;
    }
  }
  return map;
}

/** Full-range months for the mini-month to bound its navigation. */
export function monthBounds(events: EventItem[]): { min: Date; max: Date } {
  if (events.length === 0) {
    const now = new Date();
    return { min: startOfMonth(now), max: endOfMonth(now) };
  }
  let min = startOfDay(new Date(events[0].startsAt));
  let max = startOfDay(new Date(events[0].endsAt ?? events[0].startsAt));
  for (const ev of events) {
    const s = startOfDay(new Date(ev.startsAt));
    const e = startOfDay(new Date(ev.endsAt ?? ev.startsAt));
    if (s < min) min = s;
    if (e > max) max = e;
  }
  return { min: startOfMonth(min), max: endOfMonth(max) };
}
