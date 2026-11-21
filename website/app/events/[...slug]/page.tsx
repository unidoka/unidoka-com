import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchEventServer,
  fetchIcalFeedsServer,
  type EventDetail,
  type EventsLocale,
} from "@/utils/api/events";
import { colorForOrganizer } from "@/app/events/_components/organizer-meta";
import { parseEventDate } from "@/app/events/_components/date-utils";
import { MapLinks } from "@/app/events/_components/map-links";
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
  return `${siteUrl}${localePath(`/events/${event.id}/${event.slug}`, locale)}`;
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
  const imageUrl = cover ?? `${siteUrl}/og-default.png`;
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
      ...(icalUrl ? { types: { "text/calendar": icalUrl } } : {}),
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
    redirect(localePath(`/events/${event.id}/${event.slug}`, locale));
  }

  // ── Case 2: New /events/[id]/[slug] ──────────────────────────────
  const [id, eventSlug] = slug;
  const event = await fetchEventServer(eventSlug, locale);

  if (!event) {
    // Slug may have been edited. Retry by ID.
    const byId = await fetchEventServer(id, locale);
    if (byId) {
      redirect(localePath(`/events/${byId.id}/${byId.slug}`, locale));
    }
    notFound();
  }

  // Slug matched but ID doesn't - user edited the UUID in the URL bar.
  if (event.id !== id) {
    redirect(localePath(`/events/${event.id}/${event.slug}`, locale));
  }

  // ── Render ───────────────────────────────────────────────────────
  const siteUrl = siteOrigin();
  const canonicalUrl = eventUrlFor(event, siteUrl, locale);
  const imageUrl =
    absoluteUrl(event.cover_image_src, siteUrl) ?? `${siteUrl}/og-default.png`;
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

  const color = colorForOrganizer(event.organizer);
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

  const teaser = (event.short_description || "")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  // MDX is only for admin-authored `mdx_content`. iCal `description` is
  // third-party HTML — compiling it as MDX would evaluate feed text as
  // JS/JSX. The backend sanitizes that HTML; render it as-is.
  const source = event.mdx_content;
  const { content } = source
    ? await compileMDX({
        source,
        options: { parseFrontmatter: false },
      })
    : { content: null };

  return (
    <main className="min-h-screen bg-(--bg) pt-24 sm:pt-32 pb-24">
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
            {event.organizer && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]  uppercase tracking-wider mb-4"
                style={{
                  color,
                  backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {event.organizer.name}
              </div>
            )}
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] mb-4">
              {event.title}
            </h1>
            {teaser && (
              <p className="text-body-1 text-(--on-bg-medium) leading-relaxed">
                {teaser}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-6">
              {(event.categories ?? []).map((category) => (
                <Badge key={category} variant="glass-static" size="chip-small">
                  {serverT(
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
                  )}
                </Badge>
              ))}
              {(event.types ?? []).map((t) =>
                t.type ? (
                  <Badge key={t.id} variant="tonal-card-static">
                    {t.type.name}
                  </Badge>
                ) : t.custom_name ? (
                  <Badge key={t.id} variant="tonal-card-static">
                    {t.custom_name}
                  </Badge>
                ) : null,
              )}
              {(event.tags ?? []).map((tag) => (
                <Badge key={tag.id} variant="glass-static" size="chip-small">
                  #{tag.name}
                </Badge>
              ))}
              {event.registration_deadline_text && (
                <Badge variant="glass-static" size="chip-small">
                  <ClockIcon className="size-3" />
                  {`${serverT(locale, "events.deadline", isEn ? "Registration deadline" : "Дедлайн регистрации")}: ${event.registration_deadline_text}`}
                </Badge>
              )}
            </div>
          </div>

          {event.cover_image_src && (
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-(--outline) mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image_src}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <MetaCard
              icon={<CalendarBlankIcon className="size-4" />}
              label={serverT(locale, "events.when", isEn ? "When" : "Когда")}
              value={dateLabel}
            />
            {locationQuery && (
              <MetaCard
                icon={<MapPinIcon className="size-4" />}
                label={serverT(locale, "events.where", isEn ? "Where" : "Место")}
                value={event.location_name || locationQuery}
              >
                <MapLinks query={locationQuery} className="mt-3" />
              </MetaCard>
            )}
            {event.price && (
              <MetaCard
                icon={<TagIcon className="size-4" />}
                label={serverT(locale, "events.price", isEn ? "Price" : "Цена")}
                value={event.price}
              />
            )}
          </div>

          {event.registration_url && (
            <div className="mb-8">
              <Button size="large" asChild>
                <Link
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {serverT(locale, "events.register", isEn ? "Register" : "Зарегистрироваться")}
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          {source ? (
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              {content}
            </article>
          ) : event.description ? (
            <article
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          ) : (
            <p className="text-body-3 text-(--on-bg-medium)">
              {serverT(locale, "events.no_description", isEn ? "No description yet." : "Описание пока не добавлено.")}
            </p>
          )}

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
      </Container>
    </main>
  );
}

function MetaCard({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) p-4">
      <div className="flex items-center gap-2 mb-1.5 text-(--on-bg-low)">
        {icon}
        <span className="text-[10px] uppercase tracking-wider ">
          {label}
        </span>
      </div>
      <p className="text-body-3  text-(--on-bg-high)">{value}</p>
      {children}
    </div>
  );
}
