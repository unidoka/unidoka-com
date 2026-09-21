"use client";
import { useMemo, useState } from "react";
import { addDays, addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import { Container } from "@/components/ui/container";
import { CalendarHeader, type ViewMode } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { AgendaView } from "./agenda-view";
import { MiniMonth } from "./mini-month";
import { SourceFilter, type Filter } from "./source-filter";
import { EventDetails } from "./event-details";
import { indexByDay } from "./date-utils";
import { SEED_EVENTS, type EventItem } from "../_data/events";
import { useIsMobile } from "@/hooks/use-mobile";

export function EventsCalendar() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<EventItem | null>(null);

  const effectiveView: ViewMode = isMobile ? "agenda" : view;

  const filtered = useMemo(
    () => (filter === "all" ? SEED_EVENTS : SEED_EVENTS.filter((e) => e.source === filter)),
    [filter]
  );

  const byDay = useMemo(() => indexByDay(filtered), [filtered]);

  const counts = useMemo(
    () => ({
      all: SEED_EVENTS.length,
      rosmolodez: SEED_EVENTS.filter((e) => e.source === "rosmolodez").length,
      roscongress: SEED_EVENTS.filter((e) => e.source === "roscongress").length,
    }),
    []
  );

  const eventDays = useMemo(() => new Set(byDay.keys()), [byDay]);

  // Navigation — week view steps by week, everything else by month.
  const onPrev = () =>
    setAnchor((d) => (effectiveView === "week" ? subWeeks(d, 1) : subMonths(d, 1)));
  const onNext = () =>
    setAnchor((d) => (effectiveView === "week" ? addWeeks(d, 1) : addMonths(d, 1)));

  const onToday = () => {
    const now = new Date();
    setAnchor(now);
    setSelected(now);
  };

  const agendaDays = useMemo(() => {
    if (effectiveView === "day") {
      const key = format(anchor, "yyyy-MM-dd");
      return [{ date: anchor, events: byDay.get(key) ?? [] }];
    }
    const start = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, "yyyy-MM-dd");
      return { date: d, events: byDay.get(key) ?? [] };
    });
  }, [effectiveView, anchor, byDay]);

  const onShowMore = (d: Date) => {
    setSelected(d);
    setAnchor(d);
    setView("week");
  };

  return (
    <Container variant="full-width" className="py-6 md:py-8">
      <div className="flex flex-col gap-4">
        <CalendarHeader
          anchor={anchor}
          view={effectiveView}
          onViewChange={setView}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
        />

        <div className="lg:hidden">
          <SourceFilter value={filter} onChange={setFilter} counts={counts} orientation="horizontal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <aside className="hidden lg:flex flex-col gap-4">
            <SourceFilter value={filter} onChange={setFilter} counts={counts} />
            <MiniMonth
              month={anchor}
              selected={selected}
              eventDays={eventDays}
              onMonthChange={setAnchor}
              onSelect={(d) => {
                setSelected(d);
                setAnchor(d);
              }}
            />
            <UpcomingList byDay={byDay} onSelectEvent={setActive} />
          </aside>

          <main className="min-w-0">
            {effectiveView === "month" && (
              <MonthView
                month={anchor}
                selected={selected}
                byDay={byDay}
                onSelectDay={(d) => {
                  setSelected(d);
                  setAnchor(d);
                }}
                onSelectEvent={setActive}
                onShowMore={onShowMore}
              />
            )}
            {effectiveView === "week" && (
              <WeekView anchor={anchor} byDay={byDay} onSelectEvent={setActive} />
            )}
            {effectiveView === "day" && <AgendaView days={agendaDays} onSelectEvent={setActive} />}
            {effectiveView === "agenda" && <AgendaView days={agendaDays} onSelectEvent={setActive} />}
          </main>
        </div>
      </div>

      <EventDetails event={active} onOpenChange={(o) => !o && setActive(null)} />
    </Container>
  );
}

function UpcomingList({
  byDay,
  onSelectEvent,
}: {
  byDay: Map<string, EventItem[]>;
  onSelectEvent: (e: EventItem) => void;
}) {
  const now = Date.now();
  const items: { date: Date; event: EventItem }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 60 && items.length < 5; i++) {
    const d = new Date(now + i * 86400000);
    const key = format(d, "yyyy-MM-dd");
    const list = byDay.get(key);
    if (!list) continue;
    for (const ev of list) {
      if (seen.has(ev.id)) continue;
      seen.add(ev.id);
      items.push({ date: d, event: ev });
      if (items.length >= 5) break;
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) p-3">
      <h3 className="text-body-5 font-semibold uppercase tracking-wider text-(--on-bg-low) mb-2 px-1">
        Скоро
      </h3>
      <ul className="flex flex-col">
        {items.map(({ date, event }) => (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => onSelectEvent(event)}
              className="w-full text-left px-2 py-2 rounded-lg hover:bg-(--state-hover) transition-colors"
            >
              <div className="text-body-5 text-(--on-bg-low) tabular-nums">
                {format(date, "d MMM")}
              </div>
              <div className="text-body-4 font-medium leading-snug line-clamp-2">
                {event.title}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
