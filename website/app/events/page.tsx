import { EventsCalendar } from "./_components/events-calendar";
import { EventsTextList } from "./_components/events-text-list";
import { getLocale } from "@/i18n/server";
import { translations } from "@/entities/i18n/translations";
import { fetchPublishedEventsServer } from "@/utils/api/events";
import {
  buildEventListJsonLd,
  siteOrigin,
} from "@/utils/events-seo";

export const revalidate = 60;

export default async function EventsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const siteUrl = siteOrigin();
  const events = await fetchPublishedEventsServer({ locale, limit: 200 });
  const itemList = buildEventListJsonLd(events, locale, siteUrl);
  const listTitle =
    translations[locale]?.["events.title"] ??
    (isEn ? "Events" : "События");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
        }}
      />
      <EventsCalendar locale={locale} />
      <EventsTextList
        events={events}
        locale={locale}
        title={listTitle}
        limit={50}
      />
    </>
  );
}
