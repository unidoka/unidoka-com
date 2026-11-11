"use client";

import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarBlank, MapPin } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";

interface Props {
  days: { date: Date; events: EventListItem[] }[];
  onSelectEvent: (e: EventListItem) => void;
}

// Strip HTML for safe text rendering in lists
const stripHtml = (str: string) => str ? str.replace(/<[^>]*>?/gm, ' ') : '';

export function AgendaView({ days, onSelectEvent }: Props) {
  const nonEmpty = days.filter((d) => d.events.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center text-body-4 text-(--on-bg-medium)">
        Нет событий в этом диапазоне.
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
              {format(date, "d", { locale: ru })}
            </span>
            <span className="text-body-4 uppercase tracking-widest text-(--on-bg-low) font-medium">
              {format(date, "EEEE, MMMM", { locale: ru })}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {events.map((ev) => {
              const color = colorForOrganizer(ev.organizer);
              const start = ev.start_at ? new Date(ev.start_at) : null;
              const end = ev.end_at ? new Date(ev.end_at) : null;

              // Fix redundant date logic
              const sameDay = start && end ? isSameDay(start, end) : false;
              let dateLabel = "";
              if (start) {
                if (sameDay) dateLabel = format(start, "d MMM", { locale: ru });
                else if (end) dateLabel = `${format(start, "d MMM", { locale: ru })} — ${format(end, "d MMM", { locale: ru })}`;
                else dateLabel = format(start, "d MMM", { locale: ru });
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
                    <span className="text-[11px] font-medium uppercase tracking-wider text-(--on-bg-medium)">
                      {ev.organizer?.name || "Событие"}
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
