"use client";

import { format, isSameDay } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { CalendarBlank, MapPin } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { parseEventDate } from "./date-utils";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";

interface Props {
  days: { date: Date; events: EventListItem[] }[];
  onSelectEvent: (e: EventListItem) => void;
}

// Strip HTML for safe text rendering in lists
const stripHtml = (str: string) => str ? str.replace(/<[^>]*>?/gm, ' ') : '';

export function AgendaView({ days, onSelectEvent }: Props) {
  const { lang, t } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const nonEmpty = days.filter((d) => d.events.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center text-body-4 text-(--on-bg-medium)">
        {t("events.calendar.no_events_range")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {nonEmpty.map(({ date, events }) => (
        <div key={date.toISOString()}>
          {/* Date Header */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-display-4 tabular-nums text-(--on-bg-high)">
              {format(date, "d", { locale: dateLocale })}
            </span>
            <span className="text-body-4 uppercase tracking-widest text-(--on-bg-low) ">
              {format(date, "EEEE, MMMM", { locale: dateLocale })}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {events.map((ev) => {
              const color = colorForOrganizer(ev.organizer);
              const start = parseEventDate(ev.start_at);
              const end = parseEventDate(ev.end_at);

              // Fix redundant date logic
              const sameDay = start && end ? isSameDay(start, end) : false;
              let dateLabel = "";
              if (start) {
                const shortFmt = lang === "en" ? "MMM d" : "d MMM";
                if (sameDay) dateLabel = format(start, shortFmt, { locale: dateLocale });
                else if (end) dateLabel = `${format(start, shortFmt, { locale: dateLocale })} - ${format(end, shortFmt, { locale: dateLocale })}`;
                else dateLabel = format(start, shortFmt, { locale: dateLocale });
                if (ev.is_all_day) dateLabel += ` · ${t("events.calendar.all_day")}`;
              }

              const cleanLocation = stripHtml(ev.location_name || "");

              return (
                <Card
                  key={`${ev.id}-${date.toISOString()}`}
                  onClick={() => onSelectEvent(ev)}
                  className="p-4 gap-2 cursor-pointer hover:border-(--on-bg-low) transition-colors rounded-lg bg-(--card) shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[11px]  uppercase tracking-wider text-(--on-bg-medium)">
                      {ev.organizer?.name || t("events.calendar.event")}
                    </span>
                  </div>

                  <h3 className="text-heading-4 leading-tight text-(--on-bg-high)">{stripHtml(ev.title)}</h3>

                  {ev.short_description && (
                    <p className="text-body-4 text-(--on-bg-medium) line-clamp-2">
                      {stripHtml(ev.short_description)}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-5 text-(--on-bg-low) mt-2">
                    {start && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarBlank className="size-3.5" />
                        {dateLabel}
                      </span>
                    )}
                    {cleanLocation && (
                      <span className="inline-flex items-center gap-1.5 truncate max-w-[250px]">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{cleanLocation}</span>
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
