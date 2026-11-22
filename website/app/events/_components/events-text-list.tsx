import Link from "next/link";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";

import { Container } from "@/components/ui/container";
import { translations } from "@/entities/i18n/translations";
import type { EventListItem, EventsLocale } from "@/utils/api/events";
import { plainText } from "@/utils/events-seo";
import { shortId } from "@/utils/short-id";

function tr(locale: EventsLocale, key: string, fallback: string): string {
  const value = translations[locale]?.[key];
  return value && value !== key ? value : fallback;
}

interface EventsTextListProps {
  events: EventListItem[];
  locale: EventsLocale;
  title: string;
  limit?: number;
}

/**
 * Server-rendered event index. The calendar is a client component, so
 * crawlers and AI readers get this plain HTML list of titles, dates,
 * places and descriptions instead of an empty shell.
 */
export function EventsTextList({
  events,
  locale,
  title,
  limit,
}: EventsTextListProps) {
  const dateLocale = locale === "en" ? enUS : ru;
  const prefix = locale === "en" ? "/en" : "";
  const visible = limit ? events.slice(0, limit) : events;

  return (
    <section aria-labelledby="events-text-list-title">
      <Container className="pb-16 pt-4 md:pb-24">
        <div className="mb-6">
          <h2 id="events-text-list-title" className="text-heading-1 md:text-display-5">
            {title}
          </h2>
        </div>

        {visible.length === 0 ? (
          <p className="text-body-3 text-(--on-bg-medium)">
            {tr(locale, "events.all_empty", "No published events yet.")}
          </p>
        ) : (
          <ul className="divide-y divide-(--outline)">
            {visible.map((event) => {
              const start = event.start_at ? new Date(event.start_at) : null;
              const end = event.end_at ? new Date(event.end_at) : null;
              const dateLabel =
                start && !Number.isNaN(start.getTime())
                  ? format(start, "d MMM yyyy", { locale: dateLocale })
                  : tr(locale, "events.date_tbd", "Date TBD");
              const timeLabel =
                start && !event.is_all_day && !Number.isNaN(start.getTime())
                  ? format(start, "HH:mm")
                  : null;
              const endLabel =
                end && !Number.isNaN(end.getTime())
                  ? format(end, "d MMM yyyy", { locale: dateLocale })
                  : null;
              const location = plainText(event.location_name || event.city);
              const description = plainText(event.short_description).slice(0, 240);
              const organizer =
                event.organizer?.name || plainText(event.custom_organizer_name);
              const categories = (event.categories ?? []).map((category) =>
                category === "competitions"
                  ? tr(locale, "events.calendar.competitions", "Competitions")
                  : tr(locale, "events.calendar.activities", "Activities"),
              );

              return (
                <li key={event.id} className="py-6">
                  <article className="grid gap-4 sm:grid-cols-[160px_1fr]">
                    <div className="text-body-4 text-(--on-bg-medium)">
                      <time dateTime={event.start_at || undefined}>
                        {dateLabel}
                      </time>
                      {timeLabel && (
                        <span className="block text-(--on-bg-low)">
                          {timeLabel}
                          {endLabel && endLabel !== dateLabel
                            ? ` – ${endLabel}`
                            : ""}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-heading-2">
                        <Link
                          href={`${prefix}/events/${shortId(event.id)}/${event.slug}`}
                          className="transition-opacity hover:opacity-70"
                        >
                          {plainText(event.title)}
                        </Link>
                      </h3>
                      {(location || organizer) && (
                        <p className="mt-1 text-body-4 text-(--on-bg-medium)">
                          {[location, organizer].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {description && (
                        <p className="mt-2 max-w-2xl text-body-3 leading-relaxed text-(--on-bg-medium)">
                          {description}
                        </p>
                      )}
                      {categories.length > 0 && (
                        <p className="mt-2 text-body-5 text-(--on-bg-low)">
                          {categories.join(" · ")}
                        </p>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}

export default EventsTextList;
