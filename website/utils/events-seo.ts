import type {
  EventDetail,
  EventListItem,
  EventsLocale,
} from "@/utils/api/events";
import { shortId } from "@/utils/short-id";

export type EventLike = EventListItem &
  Partial<
    Pick<
      EventDetail,
      "description" | "mdx_content" | "seo_title" | "meta_description" | "href" | "metro"
    >
  >;

export function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  return cleanRoot ? `${proto}://${cleanRoot}` : "http://localhost:3000";
}

export function plainText(value: string | null | undefined): string {
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

export function absoluteUrl(
  path: string | null | undefined,
  siteUrl: string,
): string | undefined {
  if (!path) return undefined;
  const trimmed = path.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export function localePrefix(locale: EventsLocale): string {
  return locale === "en" ? "/en" : "";
}

export function eventUrlFor(
  event: Pick<EventListItem, "id" | "slug">,
  siteUrl: string,
  locale: EventsLocale,
): string {
  return `${siteUrl}${localePrefix(locale)}/events/${shortId(event.id)}/${event.slug}`;
}

export function eventsIndexUrl(siteUrl: string, locale: EventsLocale): string {
  return `${siteUrl}${localePrefix(locale)}/events`;
}

export function eventImageUrl(event: EventLike, siteUrl: string): string {
  return (
    absoluteUrl(event.cover_image_src, siteUrl) ??
    eventOgImageUrl(event, siteUrl)
  );
}

/** Branded 1200x630 preview rendered by /api/og. */
export function eventOgImageUrl(event: EventLike, siteUrl: string): string {
  const params = new URLSearchParams({
    title: plainText(event.title).slice(0, 120) || "Unidoka events",
  });
  const start = event.start_at ? new Date(event.start_at) : null;
  const date =
    start && !Number.isNaN(start.getTime())
      ? start.toISOString().slice(0, 10)
      : "";
  const subtitle = [date, plainText(event.location_name || event.city)]
    .filter(Boolean)
    .join(" · ");
  if (subtitle) params.set("subtitle", subtitle.slice(0, 160));
  return `${siteUrl}/api/og?${params.toString()}`;
}

export function eventTypeNames(event: EventLike): string[] {
  return (event.types ?? []).flatMap((assignment) =>
    assignment.type?.name
      ? [assignment.type.name]
      : assignment.custom_name
        ? [assignment.custom_name]
        : [],
  );
}

export function eventCategory(event: EventLike): string | undefined {
  return eventTypeNames(event)[0];
}

export function eventKeywords(
  event: EventLike,
  locale: EventsLocale,
): string[] {
  const values = [
    event.title,
    ...(event.tags ?? []).map((tag) => tag.name),
    ...eventTypeNames(event),
    event.organizer?.name,
    event.city,
    ...(event.categories ?? []).map((category) =>
      category === "competitions"
        ? locale === "en"
          ? "competition"
          : "соревнование"
        : locale === "en"
          ? "activity"
          : "мероприятие",
    ),
    ...(locale === "en"
      ? ["event", "meetup", "conference", "Unidoka"]
      : ["событие", "мероприятие", "конференция", "Unidoka"]),
  ];
  return Array.from(
    new Set(
      values.filter(
        (value): value is string => Boolean(value && value.trim()),
      ),
    ),
  ).slice(0, 24);
}

export function eventMetaDescription(
  event: EventLike,
  locale: EventsLocale,
): string {
  const explicit = plainText(event.meta_description || event.short_description);
  if (explicit) return explicit;
  const body = plainText(event.description);
  if (body) return body;
  return locale === "en"
    ? `Event in the Unidoka calendar: ${plainText(event.title)}.`
    : `Событие в календаре Unidoka: ${plainText(event.title)}.`;
}

/** Full Event object used by the detail page and list pages. */
export function buildEventJsonLd(
  event: EventLike,
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

  const description =
    plainText(
      event.meta_description ||
        event.short_description ||
        event.description ||
        "",
    ).slice(0, 5000) || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: plainText(event.title),
    ...(description ? { description } : {}),
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
    ...(event.capacity ? { maximumAttendeeCapacity: event.capacity } : {}),
    organizer: {
      "@type": "Organization",
      name: plainText(organizerName),
      url: siteUrl,
    },
    ...(event.registration_url || priceMatch
      ? {
          offers: {
            "@type": "Offer",
            url: event.registration_url || canonicalUrl,
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
                ? isEn
                  ? "competition"
                  : "соревнование"
                : isEn
                  ? "activity"
                  : "мероприятие",
            ),
          ].join(", "),
        }
      : {}),
  };
}

/** ItemList of full Event objects, used by the calendar and event lists. */
export function buildEventListJsonLd(
  events: EventLike[],
  locale: EventsLocale,
  siteUrl: string,
) {
  const isEn = locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEn ? "Unidoka events" : "События Unidoka",
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildEventJsonLd(
        event,
        locale,
        siteUrl,
        eventUrlFor(event, siteUrl, locale),
        eventImageUrl(event, siteUrl),
      ),
    })),
  };
}

export function buildEventBreadcrumbJsonLd(
  event: EventLike,
  locale: EventsLocale,
  siteUrl: string,
  canonicalUrl: string,
) {
  const isEn = locale === "en";
  return {
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
}
