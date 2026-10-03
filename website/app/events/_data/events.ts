/**
 * The calendar no longer ships seed data. Everything the /events page
 * renders comes from GET /api/v1/events (approved events only). This
 * module is now just a thin re-export of the API types, kept so the
 * dozens of existing imports don't need to change.
 *
 * `EventItem` is an alias of `EventListItem` from the API — one shape,
 * one source of truth.
 */
export type {
  EventListItem as EventItem,
  EventListItem,
  OrganizerRef,
  SubdirectionRef,
  TypeAssignment,
} from "@/utils/api/events";

/** A row rendered in the day drawer / week column: the event + which day it sits on. */
export interface EventDayRef {
  event: import("@/utils/api/events").EventListItem;
  date: Date;
}
