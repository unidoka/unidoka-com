"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleNotchIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { CalendarHeader, type ViewMode } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { AgendaView } from "./agenda-view";
import { MiniMonth } from "./mini-month";
import { FilterPanel } from "./filter-panel";
import { EventDetails } from "./event-details";
import { indexByDay } from "./date-utils";
import { applyFilters, EMPTY_FILTER, type FilterState } from "./filters";
import { fetchPublishedEventsClient, type EventListItem } from "@/utils/api/events";

/**
 * The calendar reads from GET /api/v1/events (approved events only).
 * There is no local seed — whatever the DB has is what renders.
 *
 * Three states:
 *   loading  → skeleton spinner
 *   error    → retry card with the backend message
 *   ready    → calendar
 */
type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; events: EventListItem[] }
  | { kind: "error"; message: string };

export function EventsCalendar() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [active, setActive] = useState<EventListItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const events = await fetchPublishedEventsClient();
        if (!cancelled) setState({ kind: "ready", events });
      } catch (err: any) {
        if (!cancelled)
          setState({
            kind: "error",
            message: err?.message || "Не удалось загрузить события",
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allEvents = state.kind === "ready" ? state.events : [];
  const filtered = useMemo(() => applyFilters(allEvents, filter), [allEvents, filter]);
  const byDay = useMemo(() => indexByDay(filtered), [filtered]);
  const eventDays = useMemo(() => new Set(byDay.keys()), [byDay]);

  const onPrev = () =>
    setAnchor((d) => (view === "week" ? subWeeks(d, 1) : subMonths(d, 1)));
  const onNext = () =>
    setAnchor((d) => (view === "week" ? addWeeks(d, 1) : addMonths(d, 1)));
  const onToday = () => {
    const now = new Date();
    setAnchor(now);
    setSelected(now);
  };

  const agendaDays = useMemo(() => {
    if (view === "day") {
      const key = format(anchor, "yyyy-MM-dd");
      return [{ date: anchor, events: byDay.get(key) ?? [] }];
    }
    const start = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, "yyyy-MM-dd");
      return { date: d, events: byDay.get(key) ?? [] };
    });
  }, [view, anchor, byDay]);

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
          view={view}
          onViewChange={setView}
          onAnchorChange={setAnchor}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          allEvents={allEvents}
          filter={filter}
          onFilterChange={setFilter}
        />

        {state.kind === "loading" && (
          <Card className="rounded-3xl border-(--outline) p-16 text-center">
            <CircleNotchIcon className="size-6 animate-spin mx-auto text-(--on-bg-low)" />
            <p className="text-body-4 text-(--on-bg-medium) mt-4">Загрузка событий…</p>
          </Card>
        )}

        {state.kind === "error" && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-8 text-center">
            <WarningCircleIcon className="size-6 mx-auto text-(--error) mb-3" />
            <p className="text-body-3 text-(--error) mb-4">{state.message}</p>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
            >
              Повторить
            </Button>
          </Card>
        )}

        {state.kind === "ready" && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
            <aside className="hidden lg:flex flex-col gap-4">
              <FilterPanel allEvents={allEvents} value={filter} onChange={setFilter} />
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
              {allEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center">
                  <p className="text-body-3 text-(--on-bg-medium) mb-1">
                    Пока нет событий
                  </p>
                  <p className="text-body-5 text-(--on-bg-low)">
                    События появятся здесь после одобрения модератором.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center">
                  <p className="text-body-3 text-(--on-bg-medium)">
                    Ничего не найдено по этим фильтрам.
                  </p>
                </div>
              ) : (
                <>
                  {view === "month" && (
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
                  {view === "week" && (
                    <WeekView anchor={anchor} byDay={byDay} onSelectEvent={setActive} />
                  )}
                  {(view === "day" || view === "agenda") && (
                    <AgendaView days={agendaDays} onSelectEvent={setActive} />
                  )}
                </>
              )}
            </main>
          </div>
        )}
      </div>
      <EventDetails event={active} onOpenChange={(o) => !o && setActive(null)} />
    </Container>
  );
}

function UpcomingList({
  byDay,
  onSelectEvent,
}: {
  byDay: Map<string, EventListItem[]>;
  onSelectEvent: (e: EventListItem) => void;
}) {
  const now = Date.now();
  const items: { date: Date; event: EventListItem }[] = [];
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
