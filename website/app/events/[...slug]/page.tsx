import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import {
  ArrowUpRightIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  fetchEventServer,
  fetchIcalFeedsServer,
  fetchPublishedEventsServer,
  type EventDetail,
  type EventListItem,
  type EventsLocale,
} from "@/utils/api/events";
import { shortId } from "@/utils/short-id";
import { parseEventDate } from "@/app/events/_components/date-utils";
import { eventOgImageUrl } from "@/utils/events-seo";
import { MapLinks } from "@/app/events/_components/map-links";
import { ShareEventDialog } from "@/app/events/_components/share-event-dialog";
import { getLocale, localePath } from "@/i18n/server";
import { translations } from "@/entities/i18n/translations";

export const revalidate = 60;

/**
 * Catch-all route to handle both:
 *   - /events/[id]/[slug]  (new canonical URL)
 *   - /events/[slug]       (legacy URL, redirects to canonical)
 *
 * Next.js forbids having `[slug]` and `[id]` folders side-by-side,
 * so we use `[...slug]` (an array) and branch based on its length.
 */

function plainText(value: string | null | undefined): string {
  return (value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function serverT(
  locale: EventsLocale,
  key: string,
  fallback: string,
): string {
  const value = translations[locale]?.[key];
  return value && value !== key ? value : fallback;
}

function eventTypeNames(event: EventDetail): string[] {
  return (event.types ?? []).flatMap((assignment) =>
    assignment.type?.name
      ? [assignment.type.name]
      : assignment.custom_name
        ? [assignment.custom_name]
        : [],
  );
}

function eventKeywords(event: EventDetail, locale: EventsLocale): string[] {
  const values = [
    event.title,
    ...(event.tags ?? []).map((tag) => tag.name),
    ...eventTypeNames(event),
    event.organizer?.name,
    event.city,
    ...(event.categories ?? []).map((category) =>
      category === "competitions"
        ? (locale === "en" ? "competition" : "соревнование")
        : (locale === "en" ? "activity" : "мероприятие"),
    ),
    ...(locale === "en"
      ? ["event", "meetup", "conference", "Unidoka"]
      : ["событие", "мероприятие", "конференция", "Unidoka"]),
  ];
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value && value.trim()))),
  ).slice(0, 24);
}

function eventCategory(event: EventDetail): string | undefined {
  return eventTypeNames(event)[0];
}

function buildEventJsonLd(
  event: EventDetail,
  locale: EventsLocale,
  siteUrl: string,
  canonicalUrl: string,
  imageUrl: string,
) {
  const isEn = locale === "en";
  const locationName = plainText(event.location_name || event.city);
  const hasPhysicalLocation = Boolean(locationName || event.address);

  const location = hasPhysicalLocation
    ? {
      "@type": "Place",
      name: locationName || (isEn ? "Venue" : "Место проведения"),
      address: {
        "@type": "PostalAddress",
        ...(event.address ? { streetAddress: plainText(event.address) } : {}),
        ...(event.city ? { addressLocality: plainText(event.city) } : {}),
        addressCountry: "RU",
      },
    }
    : {
      "@type": "VirtualLocation",
      url: event.registration_url || event.href || canonicalUrl,
    };

  const priceMatch = plainText(event.price).match(/\d+(?:[.,]\d+)?/);
  const isFree =
    /бесплат|free/i.test(event.price || "") || priceMatch?.[0] === "0";

  const organizerName =
    event.organizer?.name || event.custom_organizer_name || "Unidoka";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: plainText(event.title),
    description:
      plainText(
        event.meta_description ||
        event.short_description ||
        event.description ||
        "",
      ).slice(0, 5000) || undefined,
    startDate: event.start_at || undefined,
    endDate: event.end_at || event.start_at || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: hasPhysicalLocation
      ? "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    location,
    image: [imageUrl],
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: isEn ? "en-US" : "ru-RU",
    ...(isFree ? { isAccessibleForFree: true } : {}),
    organizer: {
      "@type": "Organization",
      name: plainText(organizerName),
      url: siteUrl,
    },
    ...(event.registration_url
      ? {
        offers: {
          "@type": "Offer",
          url: event.registration_url,
          availability: "https://schema.org/InStock",
          ...(priceMatch
            ? {
              price: priceMatch[0].replace(",", "."),
              priceCurrency: "RUB",
            }
            : {}),
        },
      }
      : {}),
    ...(eventTypeNames(event).length || (event.tags ?? []).length
      ? {
        keywords: [
          ...(event.tags ?? []).map((tag) => tag.name),
          ...eventTypeNames(event),
          ...(event.categories ?? []).map((category) =>
            category === "competitions"
              ? (isEn ? "competition" : "соревнование")
              : (isEn ? "activity" : "мероприятие"),
          ),
        ].join(", "),
      }
      : {}),
  };
}

function absoluteUrl(
  path: string | null | undefined,
  siteUrl: string,
): string | undefined {
  if (!path) return undefined;
  const trimmed = path.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (cleanRoot) return `${proto}://${cleanRoot}`;
  return "http://localhost:3000";
}

function eventUrlFor(
  event: EventDetail,
  siteUrl: string,
  locale: EventsLocale,
): string {
  return `${siteUrl}${localePath(`/events/${shortId(event.id)}/${event.slug}`, locale)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";

  // If it's a 1-segment URL (legacy), we'll redirect in the main component.
  // We return a basic title here just in case, but the redirect will fire first.
  if (!slug || slug.length !== 2) {
    return { title: isEn ? "Event" : "Событие" };
  }

  const eventSlug = slug[1];
  const otherLocale: EventsLocale = isEn ? "ru" : "en";

  const [event, icalFeeds, otherEvent] = await Promise.all([
    fetchEventServer(eventSlug, locale),
    fetchIcalFeedsServer(locale),
    fetchEventServer(eventSlug, otherLocale),
  ]);
  if (!event) {
    return { title: isEn ? "Event not found" : "Событие не найдено" };
  }

  const primaryCategory = event.categories?.[0] ?? "activities";
  const icalUrl =
    icalFeeds[primaryCategory] ?? icalFeeds.activities ?? icalFeeds.competitions;

  const siteUrl = siteOrigin();
  const title = event.seo_title || event.title;
  const description =
    plainText(event.meta_description || event.short_description) ||
    plainText(event.description) ||
    (isEn
      ? `Event in the Unidoka calendar: ${plainText(event.title)}.`
      : `Событие в календаре Unidoka: ${plainText(event.title)}.`);
  const canonicalUrl = eventUrlFor(event, siteUrl, locale);

  const cover = absoluteUrl(event.cover_image_src, siteUrl);
  const imageUrl = cover ?? eventOgImageUrl(event, siteUrl);
  const category = eventCategory(event);
  const organizerName = event.organizer?.name || event.custom_organizer_name;

  const canonicalRu = isEn
    ? otherEvent
      ? eventUrlFor(otherEvent, siteUrl, "ru")
      : undefined
    : canonicalUrl;
  const canonicalEn = isEn
    ? canonicalUrl
    : otherEvent
      ? eventUrlFor(otherEvent, siteUrl, "en")
      : undefined;

  const languages: Record<string, string> = {};
  if (canonicalRu) languages.ru = canonicalRu;
  if (canonicalEn) languages.en = canonicalEn;
  languages["x-default"] = canonicalRu ?? canonicalUrl;

  return {
    title,
    description,
    keywords: eventKeywords(event, locale),
    ...(organizerName ? { authors: [{ name: organizerName }] } : {}),
    ...(category ? { category } : {}),
    alternates: {
      canonical: canonicalUrl,
      languages,
      types: {
        ...(icalUrl ? { "text/calendar": icalUrl } : {}),
        "text/plain": `${siteUrl}${isEn ? "/en" : ""}/events/llms.txt`,
        "application/json": `${siteUrl}/api/v1/events/${encodeURIComponent(event.slug)}?locale=${locale}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: { "content-language": isEn ? "en" : "ru" },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      siteName: "Unidoka",
      locale: isEn ? "en_US" : "ru_RU",
      alternateLocale: isEn ? ["ru_RU"] : ["en_US"],
      images: [{ url: imageUrl, alt: plainText(event.title) }],
      ...(event.start_at ? { publishedTime: event.start_at } : {}),
      ...(event.updated_at ? { modifiedTime: event.updated_at } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";
  const dateLocale = isEn ? enUS : ru;

  // Guard against /events or /events/a/b/c
  if (!slug || slug.length === 0 || slug.length > 2) {
    notFound();
  }

  // ── Case 1: Legacy /events/[slug] ────────────────────────────────
  if (slug.length === 1) {
    const legacySlug = slug[0];
    const event = await fetchEventServer(legacySlug, locale);
    if (!event) notFound();

    // 307 redirect to the new canonical URL
    redirect(localePath(`/events/${shortId(event.id)}/${event.slug}`, locale));
  }

  // ── Case 2: New /events/[id]/[slug] ──────────────────────────────
  const [id, eventSlug] = slug;
  const event = await fetchEventServer(eventSlug, locale);

  if (!event) {
    // Slug may have been edited. Resolve the public short id against the
    // current calendar, then redirect to the canonical slug.
    const byId = await fetchEventServer(id, locale);
    if (byId) {
      redirect(localePath(`/events/${shortId(byId.id)}/${byId.slug}`, locale));
    }
    const all = await fetchPublishedEventsServer({ locale, limit: 1000 });
    const matched = all.find((candidate) => shortId(candidate.id) === id);
    if (matched) {
      redirect(
        localePath(`/events/${shortId(matched.id)}/${matched.slug}`, locale),
      );
    }
    notFound();
  }

  // Slug matched but the public id doesn't - user edited the id in the URL bar.
  if (shortId(event.id) !== id) {
    redirect(localePath(`/events/${shortId(event.id)}/${event.slug}`, locale));
  }

  // ── Render ───────────────────────────────────────────────────────
  const siteUrl = siteOrigin();
  const canonicalUrl = eventUrlFor(event, siteUrl, locale);
  const imageUrl =
    absoluteUrl(event.cover_image_src, siteUrl) ??
    eventOgImageUrl(event, siteUrl);
  const jsonLd = buildEventJsonLd(
    event,
    locale,
    siteUrl,
    canonicalUrl,
    imageUrl,
  );
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEn ? "Home" : "Главная",
        item: `${siteUrl}${isEn ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEn ? "Events" : "События",
        item: `${siteUrl}${isEn ? "/en/events" : "/events"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: plainText(event.title),
        item: canonicalUrl,
      },
    ],
  };

  const start = parseEventDate(event.start_at);
  const end = parseEventDate(event.end_at);
  const locationQuery = [event.location_name, event.address, event.city]
    .map((part) => plainText(part))
    .filter(Boolean)
    .join(", ");
  const sameDay =
    start && end ? start.toDateString() === end.toDateString() : false;

  const dayFormat = isEn ? "MMMM d, yyyy" : "d MMMM yyyy";
  const allDayLabel = isEn ? "all day" : "весь день";
  const dateTbaLabel = serverT(locale, "events.date_tbd", isEn ? "Date TBD" : "Дата уточняется");

  const dateLabel = start
    ? event.is_all_day
      ? sameDay || !end
        ? `${format(start, dayFormat, { locale: dateLocale })} · ${allDayLabel}`
        : `${format(start, dayFormat, { locale: dateLocale })} - ${format(end, dayFormat, { locale: dateLocale })} · ${allDayLabel}`
      : sameDay && end
        ? `${format(start, `${dayFormat}, HH:mm`, { locale: dateLocale })} - ${format(end, "HH:mm")}`
        : end
          ? `${format(start, dayFormat, { locale: dateLocale })} - ${format(end, dayFormat, { locale: dateLocale })}`
          : format(start, `${dayFormat}, HH:mm`, { locale: dateLocale })
    : dateTbaLabel;



  // MDX is only for admin-authored `mdx_content`. iCal `description` is
  // third-party HTML - compiling it as MDX would evaluate feed text as
  // JS/JSX. The backend sanitizes that HTML; render it as-is.
  const source = event.mdx_content;
  const { content } = source
    ? await compileMDX({
      source,
      options: { parseFrontmatter: false },
    })
    : { content: null };

  const catalog = await fetchPublishedEventsServer({ locale, limit: 200 });
  const currentCategories = new Set(event.categories ?? []);
  const recommendations: EventListItem[] = catalog
    .filter((candidate) => candidate.id !== event.id)
    .map((candidate) => {
      let score = 0;
      if (
        event.organizer?.id &&
        candidate.organizer?.id === event.organizer.id
      ) {
        score += 3;
      }
      if ((candidate.categories ?? []).some((c) => currentCategories.has(c))) {
        score += 2;
      }
      if (candidate.start_at && new Date(candidate.start_at) >= new Date()) {
        score += 1;
      }
      return { candidate, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.candidate.start_at || "").localeCompare(
        b.candidate.start_at || "",
      );
    })
    .slice(0, 6)
    .map(({ candidate }) => candidate);

  return (
    <div className="pt-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05]">
                {event.title}
              </h1>
            </div>
            {(() => {
              const meta = [
                event.organizer?.name || event.custom_organizer_name || null,
                ...(event.categories ?? []).map((category) =>
                  serverT(
                    locale,
                    category === "competitions"
                      ? "events.calendar.competitions"
                      : "events.calendar.activities",
                    isEn
                      ? category === "competitions"
                        ? "Competitions"
                        : "Activities"
                      : category === "competitions"
                        ? "Соревнования"
                        : "Мероприятия",
                  ),
                ),
                ...(event.types ?? []).map((assignment) =>
                  assignment.type?.name || assignment.custom_name || null,
                ),
                ...(event.tags ?? []).map((tag) => `#${tag.name}`),
                event.registration_deadline_text
                  ? `${serverT(locale, "events.deadline", isEn ? "Registration deadline" : "Дедлайн регистрации")}: ${event.registration_deadline_text}`
                  : null,
              ].filter(Boolean);
              return meta.length > 0 ? (
                <p className="mt-4 text-body-4 text-(--on-bg-low)">
                  {meta.join(" · ")}
                </p>
              ) : null;
            })()}
          </div>

          <div>
            <div className="sticky top-20 z-20 mb-8 flex items-center gap-2 rounded-2xl border border-(--outline) bg-(--bg) p-2">
              <ShareEventDialog
                title={plainText(event.title)}
                url={canonicalUrl}
                locale={locale}
                dateLabel={dateLabel}
                location={locationQuery}
                organizer={event.organizer?.name || event.custom_organizer_name || undefined}
                price={event.price || undefined}
              />
              {event.registration_url && (
                <Button asChild size="small" className="ml-auto">
                  <Link
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {serverT(locale, "events.register", isEn ? "Register" : "Зарегистрироваться")}
                    <ArrowUpRightIcon className="size-4" />
                  </Link>
                </Button>
              )}
            </div>

          {event.cover_image_src && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image_src}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <dl className="grid grid-cols-1 gap-6 border-y border-(--outline) py-6 sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-body-5 text-(--on-bg-low)">
                {serverT(locale, "events.when", isEn ? "When" : "Когда")}
              </dt>
              <dd className="mt-1 text-body-3 text-(--on-bg-high)">
                {dateLabel}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-body-5 text-(--on-bg-low)">
                {serverT(locale, "events.where", isEn ? "Where" : "Место")}
              </dt>
              <dd className="mt-1 text-body-3 text-(--on-bg-high)">
                {locationQuery
                  ? event.location_name || locationQuery
                  : isEn
                    ? "Online"
                    : "Онлайн"}
              </dd>
              {locationQuery && (
                <MapLinks query={locationQuery} className="mt-2" />
              )}
            </div>
            <div className="min-w-0">
              <dt className="text-body-5 text-(--on-bg-low)">
                {event.price
                  ? serverT(locale, "events.price", isEn ? "Price" : "Цена")
                  : serverT(
                    locale,
                    "events.details.organizer",
                    isEn ? "Organizer" : "Организатор",
                  )}
              </dt>
              <dd className="mt-1 text-body-3 text-(--on-bg-high)">
                {event.price ||
                  event.organizer?.name ||
                  event.custom_organizer_name ||
                  "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-10">
            {source ? (
              <article className="prose prose-neutral dark:prose-invert max-w-none break-words [overflow-wrap:anywhere]">
                {content}
              </article>
            ) : event.description ? (
              <article
                className="prose prose-neutral dark:prose-invert max-w-none break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : event.short_description ? (
              <article
                className="prose prose-neutral dark:prose-invert max-w-none break-words [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{ __html: event.short_description }}
              />
            ) : (
              <p className="text-body-3 text-(--on-bg-medium)">
                {serverT(locale, "events.no_description", isEn ? "No description yet." : "Описание пока не добавлено.")}
              </p>
            )}
          </div>

          {(event.other_dates ?? []).length > 0 && (
            <section className="mt-12 pt-8 border-t border-(--outline)">
              <h2 className="text-heading-2 mb-4">
                {serverT(locale, "events.more_dates", isEn ? "More dates" : "Дополнительные даты")}
              </h2>
              <ul className="space-y-2">
                {(event.other_dates ?? []).map((d, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <ClockIcon className="size-4 text-(--on-bg-low)" />
                    <span className="">{d.label}</span>
                    <span className="text-body-4 text-(--on-bg-medium)">
                      {format(new Date(d.at), isEn ? "MMMM d, yyyy, HH:mm" : "d MMMM yyyy, HH:mm", {
                        locale: dateLocale,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          </div>

          {recommendations.length > 0 && (
            <section className="mt-12 border-t border-(--outline) pt-8">
              <h2 className="mb-4 text-heading-2">
                {serverT(locale, "events.recommended", isEn ? "More events" : "Ещё события")}
              </h2>
              <ul className="divide-y divide-(--outline)">
                {recommendations.map((item) => {
                  const itemStart = parseEventDate(item.start_at);
                  return (
                    <li key={item.id} className="py-4">
                      <Link
                        href={localePath(
                          `/events/${shortId(item.id)}/${item.slug}`,
                          locale,
                        )}
                        className="group flex flex-col gap-1 transition-opacity hover:opacity-70"
                      >
                        <span className="text-body-2 text-(--on-bg-high)">
                          {plainText(item.title)}
                        </span>
                        <span className="text-body-4 text-(--on-bg-medium)">
                          {[
                            itemStart
                              ? format(
                                itemStart,
                                isEn ? "MMM d, yyyy" : "d MMM yyyy",
                                { locale: dateLocale },
                              )
                              : null,
                            plainText(item.location_name || item.city),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5">
                <Button variant="outlined" size="small" asChild>
                  <Link href={localePath("/events", locale)}>
                    {serverT(
                      locale,
                      "events.see_in_calendar",
                      isEn ? "See all in calendar" : "Смотреть все в календаре",
                    )}
                  </Link>
                </Button>
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
