"use client";
import { useMemo, useState } from "react";
import { isSameDay, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  CalendarBlank,
  MapPin,
  Plus,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { EventsCalendar } from "./_components/events-calendar";
import {
  SEED_EVENTS,
  SOURCE_LABEL,
  type EventItem,
  type EventSource,
} from "./_data/events";
import { cn } from "@/lib/utils";

type Filter = "all" | EventSource;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "rosmolodez", label: "Росмолодёжь" },
  { id: "roscongress", label: "Росконгресс" },
];

export default function EventsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const filtered = useMemo(
    () => (filter === "all" ? SEED_EVENTS : SEED_EVENTS.filter((e) => e.source === filter)),
    [filter]
  );

  const eventDates = useMemo(
    () => filtered.map((e) => new Date(e.startsAt)),
    [filtered]
  );

  const dayEvents = useMemo(() => {
    if (!selected) return [];
    return filtered.filter((e) => isSameDay(new Date(e.startsAt), selected));
  }, [selected, filtered]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...filtered]
      .filter((e) => +new Date(e.startsAt) >= now)
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  }, [filtered]);

  return (
    <Container className="py-12 md:py-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Badge variant="glass-static">Календарь событий</Badge>
          <h1 className="text-display-2 mt-4">
            Все события Росмолодёжи и Росконгресса
          </h1>
          <p className="text-body-3 text-(--on-bg-medium) mt-3 max-w-2xl">
            Форумы, конкурсы, хакатоны и фестивали в одном календаре. Выберите
            день, чтобы увидеть события, или добавьте своё.
          </p>
        </div>

        <AddEventDialog>
          <Button size="large" shape="round">
            <Plus /> Добавить событие
          </Button>
        </AddEventDialog>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-2 rounded-full text-body-4 font-medium transition-colors",
              filter === f.id
                ? "bg-(--primary-glass) text-(--primary)"
                : "text-(--on-bg-medium) hover:bg-(--state-hover)"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
        <EventsCalendar
          eventDates={eventDates}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="min-w-0">
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-heading-2 capitalize">
                  {format(selected, "d MMMM yyyy", { locale: ru })}
                </h2>
                <Button variant="text" size="small" onClick={() => setSelected(undefined)}>
                  Показать все
                </Button>
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-body-4 text-(--on-bg-medium)">
                  Нет событий в этот день.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dayEvents.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-heading-2 mb-4">Ближайшие события</h2>
              {upcoming.length === 0 ? (
                <p className="text-body-4 text-(--on-bg-medium)">
                  Пока нет предстоящих событий.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.slice(0, 12).map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const start = new Date(event.startsAt);
  return (
    <Card className="p-5 gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="tonal-static">{SOURCE_LABEL[event.source]}</Badge>
            {event.tags?.map((tag) => (
              <Badge key={tag} variant="tonal-card-static">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-heading-3 leading-tight">{event.title}</h3>
        </div>
        {event.url && (
          <Button variant="text" size="icon-small" asChild>
            <a href={event.url} target="_blank" rel="noopener noreferrer" aria-label="Открыть сайт события">
              <ArrowUpRight className="size-5" />
            </a>
          </Button>
        )}
      </div>

      <p className="text-body-4 text-(--on-bg-medium)">{event.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-5 text-(--on-bg-low)">
        <span className="inline-flex items-center gap-1">
          <CalendarBlank className="size-3.5" />
          {format(start, "d MMM yyyy", { locale: ru })}
          {event.endsAt && ` — ${format(new Date(event.endsAt), "d MMM yyyy", { locale: ru })}`}
        </span>
        {event.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {event.location}
          </span>
        )}
        {event.prize && (
          <span className="inline-flex items-center gap-1 text-(--primary)">
            {event.prize}
          </span>
        )}
      </div>
    </Card>
  );
}
