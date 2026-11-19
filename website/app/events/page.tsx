import { EventsCalendar } from "./_components/events-calendar";
import { getLocale, localePath } from "@/i18n/server";
import { fetchPublishedEventsServer } from "@/utils/api/events";

export const revalidate = 60;

function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  return cleanRoot ? `${proto}://${cleanRoot}` : "http://localhost:3000";
}

function plainText(value: string | null | undefined): string {
  return (value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function EventsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const siteUrl = siteOrigin();
  const events = await fetchPublishedEventsServer({ locale, limit: 200 });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEn ? "Unidoka events" : "События Unidoka",
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: plainText(event.title),
        url: `${siteUrl}${localePath(`/events/${event.id}/${event.slug}`, locale)}`,
        ...(event.start_at ? { startDate: event.start_at } : {}),
        ...(event.end_at ? { endDate: event.end_at } : {}),
        ...(event.location_name
          ? {
              location: {
                "@type": "Place",
                name: plainText(event.location_name),
              },
            }
          : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
        }}
      />
      <EventsCalendar locale={locale} />
    </>
  );
}
