"use client";
import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import { monthGrid } from "./date-utils";
import { EventChip } from "./event-chip";
import type { EventItem } from "../_data/events";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MAX_VISIBLE = 3;

interface Props {
  month: Date;
  selected: Date;
  byDay: Map<string, EventItem[]>;
  onSelectDay: (d: Date) => void;
  onSelectEvent: (e: EventItem) => void;
  onShowMore: (d: Date) => void;
}

export function MonthView({
  month,
  selected,
  byDay,
  onSelectDay,
  onSelectEvent,
  onShowMore,
}: Props) {
  const cells = monthGrid(month);

  return (
    <div className="flex flex-col rounded-2xl border border-(--outline) bg-(--card) overflow-hidden min-h-[680px]">
      <div className="grid grid-cols-7 border-b border-(--outline)">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="h-10 flex items-center justify-center text-body-5 font-medium uppercase tracking-wider text-(--on-bg-low)"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {cells.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const events = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const isSelected = isSameDay(day, selected);
          const overflow = events.length - MAX_VISIBLE;

          return (
            <div
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative flex flex-col gap-1 p-1.5 cursor-pointer transition-colors",
                "border-(--outline)",
                // borders: right on non-last column, bottom on non-last row
                i % 7 !== 6 && "border-r",
                i < 35 && "border-b",
                !inMonth && "bg-[color-mix(in_srgb,var(--bg)_60%,transparent)]",
                inMonth && !isSelected && "hover:bg-(--state-hover)",
                isSelected && "bg-(--primary-glass)"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-body-5 font-medium tabular-nums",
                    !inMonth && "text-(--on-bg-low)",
                    inMonth && !isToday(day) && "text-(--on-bg-medium)",
                    isToday(day) && "bg-(--primary) text-(--on-primary)"
                  )}
                >
                  {format(day, "d")}
                </span>
                {events.length > 0 && (
                  <span className="text-[10px] tabular-nums text-(--on-bg-low) hidden lg:block">
                    {events.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-h-0">
                {events.slice(0, MAX_VISIBLE).map((ev) => (
                  <EventChip
                    key={`${ev.id}-${key}`}
                    event={ev}
                    day={day}
                    compact
                    onClick={onSelectEvent}
                  />
                ))}
                {overflow > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowMore(day);
                    }}
                    className="text-[10px] text-left px-1.5 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                  >
                    +{overflow} ещё
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
