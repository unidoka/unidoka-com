"use client";
import { format, isSameDay, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { weekGrid } from "./date-utils";
import { EventChip } from "./event-chip";
import type { EventItem } from "../_data/events";
import { cn } from "@/lib/utils";

interface Props {
  anchor: Date;
  byDay: Map<string, EventItem[]>;
  onSelectEvent: (e: EventItem) => void;
}

export function WeekView({ anchor, byDay, onSelectEvent }: Props) {
  const days = weekGrid(anchor);

  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) overflow-hidden min-h-[680px] flex flex-col">
      <div className="grid grid-cols-7 border-b border-(--outline)">
        {days.map((d) => {
          const today = isToday(d);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "h-16 flex flex-col items-center justify-center gap-0.5",
                today && "bg-(--primary-glass)"
              )}
            >
              <span className="text-body-5 uppercase tracking-wider text-(--on-bg-low)">
                {format(d, "EEE", { locale: ru })}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-body-3 font-semibold tabular-nums",
                  today
                    ? "bg-(--primary) text-(--on-primary)"
                    : "text-(--on-bg-high)"
                )}
              >
                {format(d, "d")}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {days.map((d, i) => {
          const key = format(d, "yyyy-MM-dd");
          const events = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={cn(
                "flex flex-col gap-1 p-2 min-h-full",
                i !== 6 && "border-r border-(--outline)",
                isSameDay(d, new Date()) && "bg-[color-mix(in_srgb,var(--primary)_4%,transparent)]"
              )}
            >
              {events.map((ev) => (
                <EventChip
                  key={`${ev.id}-${key}`}
                  event={ev}
                  day={d}
                  onClick={onSelectEvent}
                />
              ))}
              {events.length === 0 && (
                <div className="flex-1 rounded-lg border border-dashed border-(--outline) opacity-40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
