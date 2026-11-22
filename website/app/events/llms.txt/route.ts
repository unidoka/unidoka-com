import { getLocale } from "@/i18n/server";
import { fetchIcalFeedsServer, fetchPublishedEventsServer } from "@/utils/api/events";
import {
  eventTypeNames,
  eventUrlFor,
  eventsIndexUrl,
  plainText,
  siteOrigin,
} from "@/utils/events-seo";
export const dynamic = "force-dynamic";

function feedLines(
  feeds: Partial<Record<string, string>>,
  language: string,
): string[] {
  return Object.entries(feeds)
    .filter(([, url]) => Boolean(url))
    .map(([category, url]) => `- ${language} calendar feed (${category}): ${url}`);
}

export async function GET() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const siteUrl = siteOrigin();
  const [events, feeds, otherFeeds] = await Promise.all([
    fetchPublishedEventsServer({ locale, limit: 1000 }),
    fetchIcalFeedsServer(locale),
    fetchIcalFeedsServer(isEn ? "ru" : "en"),
  ]);

  const otherLocale = isEn ? "ru" : "en";
  const otherEventsUrl = `${siteUrl}${isEn ? "" : "/en"}/events/llms.txt`;

  const lines: string[] = [
    `# Unidoka events (${isEn ? "EN" : "RU"})`,
    "",
    "> Machine-readable index of the public Unidoka events calendar. Each entry contains the canonical page, dates, place, organizer, categories, tags, price, registration link and a plain-text description.",
    "",
    "## Calendar",
    `- HTML calendar: ${eventsIndexUrl(siteUrl, locale)}`,
    `- Other language: ${otherEventsUrl}`,
    `- Events API JSON: ${siteUrl}/api/v1/events?locale=${locale}`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    ...feedLines(feeds, isEn ? "EN" : "RU"),
    ...(otherLocale && Object.keys(otherFeeds).length
      ? [`- ${isEn ? "RU" : "EN"} calendar feeds: see ${otherEventsUrl}`]
      : []),
    "",
    `## Events (${events.length})`,
    "",
  ];

  if (events.length === 0) {
    lines.push("No published events yet.", "");
  }

  for (const event of events) {
    const url = eventUrlFor(event, siteUrl, locale);
    const categories = (event.categories ?? []).map((category) =>
      category === "competitions"
        ? isEn
          ? "competition"
          : "соревнование"
        : isEn
          ? "activity"
          : "мероприятие",
    );
    const types = eventTypeNames(event);
    const tags = (event.tags ?? []).map((tag) => tag.name);
    const organizer = event.organizer?.name || plainText(event.custom_organizer_name);
    const location = plainText(event.location_name);
    const description = plainText(
      event.short_description || (event as { description?: string }).description,
    );

    lines.push(`### ${plainText(event.title)}`);
    lines.push(`- URL: ${url}`);
    lines.push(`- Start: ${event.start_at || "date TBD"}`);
    if (event.end_at) lines.push(`- End: ${event.end_at}`);
    if (event.is_all_day) lines.push("- All day: yes");
    if (location) lines.push(`- Location: ${location}`);
    if (event.address) lines.push(`- Address: ${plainText(event.address)}`);
    if (event.city) lines.push(`- City: ${plainText(event.city)}`);
    if (organizer) lines.push(`- Organizer: ${organizer}`);
    if (types.length) lines.push(`- Types: ${types.join(", ")}`);
    if (categories.length) lines.push(`- Categories: ${categories.join(", ")}`);
    if (tags.length) lines.push(`- Tags: ${tags.join(", ")}`);
    if (event.price) lines.push(`- Price: ${plainText(event.price)}`);
    if (event.capacity) lines.push(`- Capacity: ${event.capacity}`);
    if (event.registration_url)
      lines.push(`- Registration: ${event.registration_url}`);
    const eventSite = (event as { href?: string | null }).href;
    if (eventSite) lines.push(`- Event site: ${eventSite}`);
    if (description)
      lines.push(`- Description: ${description.slice(0, 2000)}`);
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": locale,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
