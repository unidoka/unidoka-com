"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { CalendarHeader, type ViewMode } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { AgendaView } from "./agenda-view";
import { MiniMonth } from "./mini-month";
import { FilterPanel } from "./filter-panel";
import { EventDetails } from "./event-details";
import { EventsSearchDialog } from "./events-search-dialog";
import { EventsSkeleton } from "./events-skeleton";
import { indexByDay } from "./date-utils";
import { applyFilters, filterFromSearchParams, filtersEqual, writeFilterToSearchParams, type FilterState } from "./filters";
import { fetchPublishedEventsClient, type EventListItem, type EventsLocale } from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; events: EventListItem[] }
  | { kind: "error"; message: string };

const VIEW_VALUES: ViewMode[] = ["month", "week", "day", "agenda"];
const DEFAULT_VIEW: ViewMode = "agenda";

function viewFromSearchParams(params: {
  get(name: string): string | null;
}): ViewMode {
  const value = params.get("view");
  return value && (VIEW_VALUES as string[]).includes(value)
    ? (value as ViewMode)
    : DEFAULT_VIEW;
}

export function EventsCalendar({ locale }: { locale: EventsLocale }) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [view, setView] = useState<ViewMode>(() =>
    viewFromSearchParams(searchParams),
  );
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [filter, setFilter] = useState<FilterState>(() =>
    filterFromSearchParams(searchParams),
  );
  const [active, setActive] = useState<EventListItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const updateView = useCallback((next: ViewMode) => {
    setView(next);
    const params = new URLSearchParams(window.location.search);
    params.set("view", next);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    // history.replaceState updates the address bar without an RSC
    // navigation. router.replace() would re-fetch the calendar on every
    // view switch and contribute to external iCal rate limits.
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const updateFilter = useCallback((next: FilterState) => {
    setFilter(next);
    const params = new URLSearchParams(window.location.search);
    writeFilterToSearchParams(params, next);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    // Keep filters shareable without re-rendering the RSC tree.
    window.history.replaceState(window.history.state, "", url);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilter(filterFromSearchParams(params));
      setView(viewFromSearchParams(params));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Pick up filters and the view from a shared/deep-linked URL even if
  // the server render did not have access to the query string.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = filterFromSearchParams(params);
    setFilter((current) => (filtersEqual(current, fromUrl) ? current : fromUrl));
    setView(viewFromSearchParams(params));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    (async () => {
      try {
        const events = await fetchPublishedEventsClient(locale);
        if (!cancelled) setState({ kind: "ready", events });
      } catch (err: any) {
        if (!cancelled)
          setState({
            kind: "error",
            message: err?.message || t("events.calendar.load_error"),
          });
      }
    })();
    return () => { cancelled = true; };
  }, [locale, t]);

  const allEvents = state.kind === "ready" ? state.events : [];
  const filtered = useMemo(() => applyFilters(allEvents, filter), [allEvents, filter]);
  const byDay = useMemo(() => indexByDay(filtered), [filtered]);
  const eventDays = useMemo(() => new Set(byDay.keys()), [byDay]);

  const onPrev = () =>
    setAnchor((d) => {
      if (view === "week") return subWeeks(d, 1);
      if (view === "day") return addDays(d, -1);
      if (view === "agenda") return addDays(d, -30);
      return subMonths(d, 1);
    });
  const onNext = () =>
    setAnchor((d) => {
      if (view === "week") return addWeeks(d, 1);
      if (view === "day") return addDays(d, 1);
      if (view === "agenda") return addDays(d, 30);
      return addMonths(d, 1);
    });
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
    const start = anchor;
    return Array.from({ length: 30 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, "yyyy-MM-dd");
      return { date: d, events: byDay.get(key) ?? [] };
    });
  }, [view, anchor, byDay]);

  const onShowMore = (d: Date) => {
    setSelected(d);
    setAnchor(d);
    updateView("week");
  };

  return (
    <Container className="py-6 md:py-8">
      <div className="flex flex-col gap-4">
        <CalendarHeader
          anchor={anchor}
          view={view}
          onViewChange={updateView}
          onAnchorChange={setAnchor}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          allEvents={allEvents}
          filter={filter}
          onFilterChange={updateFilter}
          eventDays={eventDays}
          selected={selected}
          onSelectDate={setSelected}
          onSearch={() => setSearchOpen(true)}
          locale={locale}
        />

        {state.kind === "loading" && <EventsSkeleton />}

        {state.kind === "error" && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-8 text-center">
            <WarningCircleIcon className="size-6 mx-auto text-(--error) mb-3" />
            <p className="text-body-3 text-(--error) mb-4">{state.message}</p>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
            >
              {t("events.calendar.retry")}
            </Button>
          </Card>
        )}

        {state.kind === "ready" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
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
                    {t("events.calendar.no_events")}
                  </p>
                  <p className="text-body-5 text-(--on-bg-low)">
                    {t("events.calendar.no_events_body")}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center">
                  <p className="text-body-3 text-(--on-bg-medium)">
                    {t("events.calendar.no_results")}
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
      <EventsSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        events={allEvents}
        locale={locale}
      />
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
  const { lang, t } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
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
    <div className="rounded-xl border border-(--outline) bg-(--card) p-3">
      <h3 className="text-[11px]  uppercase tracking-wider text-(--on-bg-low) mb-2 px-1">
        {t("events.calendar.soon")}
      </h3>
      <ul className="flex flex-col">
        {items.map(({ date, event }) => (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => onSelectEvent(event)}
              className="w-full text-left px-2 py-2 rounded-lg hover:bg-(--state-hover) transition-colors"
            >
              <div className="text-[11px] text-(--on-bg-low) tabular-nums ">
                {format(date, lang === "en" ? "MMM d" : "d MMM", { locale: dateLocale })}
              </div>
              <div className="text-body-4  leading-snug line-clamp-2 mt-0.5">
                {event.title.replace(/<[^>]*>?/gm, '')}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
