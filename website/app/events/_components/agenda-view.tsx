"use client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarBlank, MapPin } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { colorForOrganizer } from "./organizer-meta";
import type { EventItem } from "../_data/events";

interface Props {
  days: { date: Date; events: EventItem[] }[];
  onSelectEvent: (e: EventItem) => void;
}

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
    <div className="flex flex-col gap-6">
      {nonEmpty.map(({ date, events }) => (
        <div key={date.toISOString()}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-display-4 tabular-nums">
              {format(date, "d", { locale: ru })}
            </span>
            <span className="text-body-4 uppercase tracking-wider text-(--on-bg-low)">
              {format(date, "EEEE, MMMM", { locale: ru })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {events.map((ev) => {
              const color = colorForOrganizer(ev.organizer);
              return (
                <Card
                  key={`${ev.id}-${date.toISOString()}`}
                  onClick={() => onSelectEvent(ev)}
                  className="p-4 gap-2 cursor-pointer hover:border-(--primary) transition-colors"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {ev.organizer}
                    </span>
                  </div>
                  <h3 className="text-heading-4 leading-tight">{ev.title}</h3>
                  <p className="text-body-4 text-(--on-bg-medium) line-clamp-2">
                    {ev.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-5 text-(--on-bg-low) mt-1">
                    <span className="inline-flex items-center gap-1">
                      <CalendarBlank className="size-3.5" />
                      {format(new Date(ev.startsAt), "d MMM", { locale: ru })}
                      {ev.endsAt &&
                        ` — ${format(new Date(ev.endsAt), "d MMM", { locale: ru })}`}
                    </span>
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {ev.location}
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
