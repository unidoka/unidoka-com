"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  MapPin,
  Clock,
  ArrowUpRight,
  CalendarX,
} from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { colorForOrganizer } from "./organizer-meta";
import { TYPE_LABEL, type EventItem } from "../_data/events";

interface Props {
  day: Date | null;
  events: EventItem[];
  onClose: () => void;
  onSelectEvent: (e: EventItem) => void;
}

function pluralizeEvents(n: number): string {
  if (n === 1) return "событие";
  if (n >= 2 && n <= 4) return "события";
  return "событий";
}

/**
 * Shows every event on the clicked day as a scrolling card list.
 *
 * Responsive shell:
 *   • mobile  → vaul bottom sheet (85dvh cap)
 *   • desktop → Radix right-side sheet (full viewport height)
 *
 * Scrolling is owned by the flex-1 `min-h-0 overflow-y-auto` child in
 * both shells. Without min-h-0, flex-1 items default to `min-height:
 * auto` and refuse to shrink - overflow-y-auto then has nothing to
 * clip against, and the sheet grows past the viewport.
 */
export function DayEventsDrawer({ day, events, onClose, onSelectEvent }: Props) {
  const isMobile = useIsMobile();
  const title = day ? format(day, "d MMMM yyyy, EEEE", { locale: ru }) : "";

  // Shared card list - same markup for both shells.
  const renderCards = () => {
    if (events.length === 0) return <EmptyDay />;
    return events.map((ev) => (
      <EventCard
        key={ev.id}
        event={ev}
        onOpen={() => {
          onSelectEvent(ev);
          onClose();
        }}
      />
    ));
  };

  if (isMobile) {
    return (
      <Drawer open={day !== null} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[85dvh] flex flex-col">
          {/* shrink-0 keeps the header pinned; min-h-0 on the list
              below lets the list actually scroll instead of pushing
              the header off-screen. */}
          <DrawerHeader className="pb-2 shrink-0">
            <DrawerTitle className="capitalize text-left">
              {title}
            </DrawerTitle>
            {events.length > 0 && (
              <p className="text-body-5 text-(--on-bg-low) text-left">
                {events.length} {pluralizeEvents(events.length)}
              </p>
            )}
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-admin px-4 pb-8 flex flex-col gap-3">
            {renderCards()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={day !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 gap-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-(--outline) shrink-0">
          <SheetTitle className="capitalize text-left text-heading-2">
            {title}
          </SheetTitle>
          {events.length > 0 && (
            <p className="text-body-5 text-(--on-bg-low) text-left mt-1">
              {events.length} {pluralizeEvents(events.length)}
            </p>
          )}
        </SheetHeader>
        {/* min-h-0 is the whole fix for the missing scrollbar. flex-1
            alone doesn't bound the box; min-h-0 tells the flexbox this
            child may shrink, which gives overflow-y-auto a viewport to
            scroll inside. */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-admin px-5 py-4 flex flex-col gap-3">
          {renderCards()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function EventCard({
  event,
  onOpen,
}: {
  event: EventItem;
  onOpen: () => void;
}) {
  const color = colorForOrganizer(event.organizer);
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;
  const sameDay =
    end !== null && start.toDateString() === end.toDateString();

  const timeLabel = sameDay
    ? `${format(start, "HH:mm")} – ${format(end!, "HH:mm")}`
    : end
      ? `с ${format(start, "d MMM", { locale: ru })} по ${format(end, "d MMM", { locale: ru })}`
      : format(start, "HH:mm");

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ "--ev": color } as React.CSSProperties}
      className={
        "group/card w-full text-left rounded-2xl border border-(--outline) " +
        "bg-(--card) p-4 transition-all duration-200 " +
        "hover:border-[var(--ev)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--ev)_15%,transparent)] " +
        "active:scale-[0.995] relative overflow-hidden shrink-0"
      }
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: color }}
      />

      <div className="pl-3">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color,
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {event.organizer}
          </span>
          <Badge variant="tonal-card-static" size="chip-small">
            {TYPE_LABEL[event.type]}
          </Badge>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <h4 className="text-heading-4 leading-tight flex-1">
            {event.title}
          </h4>
          <ArrowUpRight className="size-4 shrink-0 text-(--on-bg-low) opacity-0 group-hover/card:opacity-100 transition-opacity mt-1" />
        </div>

        {event.description && (
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed line-clamp-2 mb-3">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-5 text-(--on-bg-low)">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            {timeLabel}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {event.location}
            </span>
          )}
          {event.prize && (
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={{ color }}
            >
              {event.prize}
            </span>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-(--on-bg-medium)"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
        <CalendarX className="size-6" />
      </div>
      <p className="text-body-3 text-(--on-bg-medium) mb-1">
        На этот день событий нет
      </p>
      <p className="text-body-5 text-(--on-bg-low)">
        Выберите другую дату в календаре
      </p>
    </div>
  );
}
