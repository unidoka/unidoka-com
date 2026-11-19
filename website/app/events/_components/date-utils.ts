import {
  addDays,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { EventListItem } from "@/utils/api/events";

export const WEEK_OPTS = { weekStartsOn: 1 as const };
export const KEY_FMT = "yyyy-MM-dd";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse an API date. Date-only strings are parsed as local midnight:
 * `new Date("2026-11-20")` is UTC midnight and renders as the previous
 * day in negative-offset timezones.
 */
export function parseEventDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(DATE_ONLY.test(value) ? `${value}T00:00:00` : value);
  return isNaN(d.getTime()) ? null : d;
}

export function dateKey(d: Date): string {
  return format(d, KEY_FMT);
}

/** 6×7 month grid, always 42 cells so the height never jumps. */
export function monthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), WEEK_OPTS);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekGrid(anchor: Date): Date[] {
  const start = startOfWeek(anchor, WEEK_OPTS);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Multi-day events are expanded onto every date in their range. An event
 * with no `end_at` sits on its `start_at` day only. Events with no
 * `start_at` at all are dropped - they cannot be placed on a grid.
 */
export function indexByDay(events: EventListItem[]): Map<string, EventListItem[]> {
  const map = new Map<string, EventListItem[]>();
  for (const ev of events) {
    const startDate = parseEventDate(ev.start_at);
    if (!startDate) continue;
    const start = startOfDay(startDate);
    const endDate = parseEventDate(ev.end_at);
    // `end_at` is the last visible day, so a multi-day event is painted
    // on every day from start to end inclusive. Malformed ranges still
    // land on the start day instead of disappearing.
    const end = endDate && endDate >= start ? startOfDay(endDate) : start;
    let cursor = start;
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

export function monthBounds(events: EventListItem[]): { min: Date; max: Date } {
  const now = new Date();
  if (events.length === 0) return { min: startOfMonth(now), max: endOfMonth(now) };
  const starts = events
    .map((e) => parseEventDate(e.start_at))
    .filter((d): d is Date => d !== null);
  if (starts.length === 0) return { min: startOfMonth(now), max: endOfMonth(now) };
  let min = starts[0];
  let max = starts[0];
  for (const s of starts) {
    if (s < min) min = s;
    if (s > max) max = s;
  }
  return { min: startOfMonth(min), max: endOfMonth(max) };
}
