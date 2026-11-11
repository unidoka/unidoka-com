"use client";

import { format, isToday } from "date-fns";
import { weekGrid } from "./date-utils";
import { EventChip } from "./event-chip";
import type { EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

interface Props {
  anchor: Date;
  byDay: Map<string, EventListItem[]>;
  onSelectEvent: (e: EventListItem) => void;
}

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export function WeekView({ anchor, byDay, onSelectEvent }: Props) {
  const days = weekGrid(anchor);

  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) overflow-hidden flex flex-col">
      {/* Horizontal scroll wrapper for mobile/small screens, full width on desktop */}
      <div className="w-full overflow-x-auto scrollbar-admin">
        <div className="min-w-[700px] flex flex-col h-full">
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-(--outline)">
            {days.map((d, i) => {
              const today = isToday(d);
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "h-20 flex flex-col items-center justify-center gap-1 border-r border-(--outline) last:border-r-0",
                    today && "bg-(--state-hover)"
                  )}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider text-(--on-bg-low)">
                    {WEEKDAYS[i]}
                  </span>
                  <span
                    className={cn(
                      "flex items-center justify-center size-8 rounded-full text-body-3 font-semibold tabular-nums",
                      today ? "bg-(--on-bg-high) text-(--bg)" : "text-(--on-bg-high)"
                    )}
                  >
                    {format(d, "d")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content Cells */}
          <div className="grid grid-cols-7 flex-1 min-h-[400px]">
            {days.map((d, i) => {
              const key = format(d, "yyyy-MM-dd");
              const events = byDay.get(key) ?? [];
              const today = isToday(d);
              
              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col gap-1.5 p-2 border-r border-(--outline) last:border-r-0 min-w-0",
                    today && "bg-[color-mix(in_srgb,var(--primary)_2%,transparent)]"
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
                    <div className="flex-1 rounded-lg border border-dashed border-(--outline) opacity-20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
