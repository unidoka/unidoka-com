"use client";

import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { MapPin, ArrowUpRight, CalendarX } from "@phosphor-icons/react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { parseEventDate } from "./date-utils";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  day: Date | null;
  events: EventListItem[];
  onClose: () => void;
  onSelectEvent: (e: EventListItem) => void;
}

function pluralizeEvents(n: number, isEn: boolean): string {
  if (isEn) return n === 1 ? "event" : "events";
  if (n === 1) return "событие";
  if (n >= 2 && n <= 4) return "события";
  return "событий";
}

// Strip HTML for safe rendering in lists
const stripHtml = (str: string) => str.replace(/<[^>]*>?/gm, ' ');

export function DayEventsDrawer({ day, events, onClose, onSelectEvent }: Props) {
  const isMobile = useIsMobile();
  const { lang } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const isEn = lang === "en";
  const title = day
    ? format(day, isEn ? "EEEE, MMMM d, yyyy" : "d MMMM yyyy, EEEE", { locale: dateLocale })
    : "";

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
          <DrawerHeader className="pb-2 shrink-0">
            <DrawerTitle className="capitalize text-left text-heading-4 ">{title}</DrawerTitle>
            {events.length > 0 && (
              <p className="text-body-5 text-(--on-bg-low) text-left mt-1">
                {events.length} {pluralizeEvents(events.length, isEn)}
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
      <SheetContent side="right" className="w-full sm:max-w-md p-0 gap-0 flex flex-col bg-(--bg)">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-(--outline) shrink-0 bg-(--card)">
          <SheetTitle className="capitalize text-left text-heading-3 ">{title}</SheetTitle>
          {events.length > 0 && (
            <p className="text-body-5 text-(--on-bg-low) text-left mt-1  uppercase tracking-wider">
              {events.length} {pluralizeEvents(events.length, isEn)}
            </p>
          )}
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-admin px-6 py-5 flex flex-col gap-3 bg-(--bg)">
          {renderCards()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EventCard({ event, onOpen }: { event: EventListItem; onOpen: () => void }) {
  const { lang } = useLanguage();
  const color = colorForOrganizer(event.organizer);
  const start = parseEventDate(event.start_at);
  const end = parseEventDate(event.end_at);

  const locationText = event.location_name ? stripHtml(event.location_name) : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/card w-full text-left flex gap-4 p-4 rounded-xl border border-(--outline) bg-(--card) hover:border-(--on-bg-low) transition-all duration-200 shrink-0"
    >
      {/* Time column */}
      <div className="flex flex-col items-start shrink-0 pt-0.5">
        <span className="text-body-3  tabular-nums text-(--on-bg-high)">
          {event.is_all_day ? (lang === "en" ? "all" : "весь") : start ? format(start, "HH:mm") : "--:--"}
        </span>
        {!event.is_all_day && end && (
          <span className="text-[11px] tabular-nums text-(--on-bg-low) mt-0.5">
            {format(end, "HH:mm")}
          </span>
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-body-3  leading-snug text-(--on-bg-high) line-clamp-2">
            {stripHtml(event.title)}
          </h4>
          <ArrowUpRight className="size-4 shrink-0 text-(--on-bg-low) opacity-0 group-hover/card:opacity-100 transition-opacity mt-0.5" />
        </div>

        {locationText && (
          <p className="text-body-5 text-(--on-bg-medium) truncate flex items-center gap-1.5 mt-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>
        )}
      </div>
    </button>
  );
}

function EmptyDay() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-(--state-hover) text-(--on-bg-medium) mb-4">
        <CalendarX className="size-6" />
      </div>
      <p className="text-body-3 text-(--on-bg-high)  mb-1">{t("events.details.no_events")}</p>
      <p className="text-body-4 text-(--on-bg-medium)">{t("events.details.nothing_planned")}</p>
    </div>
  );
}
