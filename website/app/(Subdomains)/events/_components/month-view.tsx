"use client";
import { useState } from "react";
import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import { monthGrid } from "./date-utils";
import { EventChip } from "./event-chip";
import { DayEventsDrawer } from "./day-events-drawer";
import { colorForOrganizer } from "./organizer-meta";
import { useIsMobile } from "@/hooks/use-mobile";
import type { EventItem } from "../_data/events";
import { cn } from "@/lib/utils";

const WEEKDAYS_LONG = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAYS_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];
const MAX_CHIPS = 3;
const MAX_DOTS = 3;

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
  const isMobile = useIsMobile();
  const cells = monthGrid(month);
  const [drawerDay, setDrawerDay] = useState<Date | null>(null);

  const handleDayClick = (day: Date) => {
    onSelectDay(day);
    if (isMobile) setDrawerDay(day);
  };

  const drawerEvents = drawerDay
    ? byDay.get(format(drawerDay, "yyyy-MM-dd")) ?? []
    : [];

  return (
    <>
      {/* Edge-to-edge on mobile: -mx-4 cancels the container's px-4 */}
      <div className="-mx-4 sm:mx-0 flex flex-col rounded-none sm:rounded-2xl border-y sm:border border-(--outline) bg-(--card) overflow-hidden min-h-[520px] sm:min-h-[680px]">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-(--outline)">
          {WEEKDAYS_LONG.map((long, i) => (
            <div
              key={long + i}
              className="h-8 sm:h-10 flex items-center justify-center text-[11px] sm:text-body-5 font-medium uppercase tracking-wider text-(--on-bg-low)"
            >
              <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
              <span className="hidden sm:inline">{long}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 flex-1">
          {cells.map((day, i) => {
            const key = format(day, "yyyy-MM-dd");
            const events = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const isSelected = isSameDay(day, selected);
            const overflow = events.length - MAX_CHIPS;

            return (
              <div
                key={key}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex flex-col gap-0.5 p-1 sm:p-1.5 cursor-pointer transition-colors",
                  "border-(--outline)",
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
                      "flex items-center justify-center min-w-5 sm:min-w-6 h-5 sm:h-6 px-1 sm:px-1.5 rounded-full text-[11px] sm:text-body-5 font-medium tabular-nums",
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

                {/* Desktop: real chips */}
                <div className="hidden lg:flex flex-col gap-0.5 min-h-0">
                  {events.slice(0, MAX_CHIPS).map((ev) => (
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

                {/* Mobile: colored dots (up to 3, then +N) */}
                {events.length > 0 && (
                  <div className="lg:hidden mt-auto flex items-center gap-0.5 justify-center pb-1">
                    {events.slice(0, MAX_DOTS).map((ev) => (
                      <span
                        key={ev.id}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: colorForOrganizer(ev.organizer) }}
                      />
                    ))}
                    {events.length > MAX_DOTS && (
                      <span className="text-[9px] tabular-nums text-(--on-bg-low) ml-0.5">
                        +{events.length - MAX_DOTS}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DayEventsDrawer
        day={drawerDay}
        events={drawerEvents}
        onClose={() => setDrawerDay(null)}
        onSelectEvent={onSelectEvent}
      />
    </>
  );
}
